#!/usr/bin/env node

/*
  Auto upload documents to Telegram storage and Supabase.
  - Uses Gemini to generate an uppercase Vietnamese title (fallback to filename).
  - Renames the local file to the AI title before upload.
  - Inserts directly as APPROVED (admin flow bypass).

  Usage:
    node upload_scripts/upload-documents.js [--root upload_scripts/files] [--document-type OTHER]
      [--academic-year "2023-2024"] [--dry-run] [--no-gemini] [--gemini-max-bytes 8000000]
*/

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const DEFAULT_ROOT = path.join(__dirname, 'files');
const TELEGRAM_CHUNK_SIZE = 19 * 1024 * 1024; // 19MB

const DEFAULT_DOCUMENT_TYPE = 'OTHER';
const DEFAULT_GEMINI_MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_DOCUMENT_TYPES = new Set(['EXAM', 'SLIDE', 'TEXTBOOK', 'OTHER']);

function parseArgs(argv) {
  const args = new Map();
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args.set(key, true);
      continue;
    }
    args.set(key, next);
    i += 1;
  }
  return args;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function ensureEnv() {
  loadEnvFile(path.join(process.cwd(), '.env.local'));
  loadEnvFile(path.join(process.cwd(), '.env'));
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.doc':
      return 'application/msword';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.xls':
      return 'application/vnd.ms-excel';
    case '.xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case '.ppt':
      return 'application/vnd.ms-powerpoint';
    case '.pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.mp4':
      return 'video/mp4';
    case '.mp3':
      return 'audio/mpeg';
    default:
      return 'application/octet-stream';
  }
}

function slugifyFileName(title) {
  const cleaned = title
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned;
}

function getUniqueFilePath(dir, baseName, ext, originalPath) {
  let candidate = path.join(dir, `${baseName}${ext}`);
  if (!fs.existsSync(candidate) || candidate === originalPath) return candidate;

  let index = 1;
  while (true) {
    candidate = path.join(dir, `${baseName} (${index})${ext}`);
    if (!fs.existsSync(candidate) || candidate === originalPath) return candidate;
    index += 1;
  }
}

function titleFromFileName(fileName) {
  const base = path.basename(fileName, path.extname(fileName));
  return base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function toUpperVi(input) {
  return input.toLocaleUpperCase('vi-VN');
}

function normalizeDocumentType(value, fallback) {
  const upper = String(value || '').trim().toUpperCase();
  if (ALLOWED_DOCUMENT_TYPES.has(upper)) return upper;
  return fallback;
}

async function callGeminiTitle({ apiKey, buffer, mimeType, fallbackTitle }) {
  if (!apiKey) return fallbackTitle;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  const base64 = buffer.toString('base64');
  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'Read the attached document and return a concise Vietnamese title in ALL CAPS. Respond with a single line and no extra punctuation.'
          },
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 64,
    },
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = String(text).trim().replace(/^"|"$/g, '');
  if (!cleaned) return fallbackTitle;
  return cleaned;
}

async function callGeminiDocumentType({ apiKey, buffer, mimeType, fallbackType }) {
  if (!apiKey) return fallbackType;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
  const base64 = buffer.toString('base64');
  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'Analyze the attached document and return only one label: EXAM, SLIDE, TEXTBOOK, or OTHER. Respond with a single word.'
          },
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 16,
    },
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return normalizeDocumentType(text, fallbackType);
}

async function uploadFileToTelegram({ token, chatId, buffer, fileName, mimeType, caption }) {
  const formData = new FormData();
  const uint8 = new Uint8Array(buffer);
  const blob = new Blob([uint8], { type: mimeType });
  formData.append('chat_id', chatId);
  formData.append('document', blob, fileName);
  if (caption) formData.append('caption', caption);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  if (!result.ok) {
    throw new Error(`Telegram API error: ${result.description || 'Unknown error'}`);
  }

  const doc = result.result.document;
  return {
    file_id: doc.file_id,
    file_unique_id: doc.file_unique_id,
    file_name: doc.file_name || fileName,
    file_size: doc.file_size || buffer.length,
    mime_type: doc.mime_type || mimeType,
    message_id: result.result.message_id,
  };
}

async function uploadFileChunked({ token, chatId, buffer, fileName, mimeType, caption }) {
  const totalSize = buffer.length;
  if (totalSize <= TELEGRAM_CHUNK_SIZE) {
    const result = await uploadFileToTelegram({ token, chatId, buffer, fileName, mimeType, caption });
    return {
      file_path: `${result.file_id}|${result.message_id}`,
      file_name: result.file_name,
      file_size: result.file_size,
      mime_type: result.mime_type,
    };
  }

  const chunkCount = Math.ceil(totalSize / TELEGRAM_CHUNK_SIZE);
  const chunkParts = [];

  for (let i = 0; i < chunkCount; i += 1) {
    const start = i * TELEGRAM_CHUNK_SIZE;
    const end = Math.min(start + TELEGRAM_CHUNK_SIZE, totalSize);
    const chunkBuffer = buffer.subarray(start, end);
    const chunkName = `${fileName}.part${i + 1}of${chunkCount}`;
    const chunkCaption = i === 0
      ? `DOC ${caption || fileName} (part ${i + 1}/${chunkCount})`
      : `DOC part ${i + 1}/${chunkCount}`;

    const result = await uploadFileToTelegram({
      token,
      chatId,
      buffer: Buffer.from(chunkBuffer),
      fileName: chunkName,
      mimeType: 'application/octet-stream',
      caption: chunkCaption,
    });

    chunkParts.push(`${result.file_id}|${result.message_id}`);
  }

  return {
    file_path: `chunk:${chunkParts.join(',')}`,
    file_name: fileName,
    file_size: totalSize,
    mime_type: mimeType,
  };
}

function walkFiles(root) {
  const results = [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function inferSubjectFromPath(filePath) {
  const parts = filePath.split(path.sep);
  const idx = parts.lastIndexOf('subject');
  if (idx >= 0 && parts[idx + 1]) {
    return parts[idx + 1];
  }
  return null;
}

async function resolveSubjectInfo(supabase, subjectName) {
  if (!subjectName) return { subject: null, majorId: null };

  const { data: exact, error: exactError } = await supabase
    .from('subjects')
    .select('*')
    .ilike('name', subjectName)
    .limit(1);

  if (!exactError && exact && exact.length > 0) {
    return { subject: exact[0], majorId: exact[0].major_id || null };
  }

  const { data: fuzzy, error: fuzzyError } = await supabase
    .from('subjects')
    .select('*')
    .ilike('name', `%${subjectName}%`)
    .limit(1);

  if (!fuzzyError && fuzzy && fuzzy.length > 0) {
    return { subject: fuzzy[0], majorId: fuzzy[0].major_id || null };
  }

  return { subject: null, majorId: null };
}

async function main() {
  ensureEnv();

  const args = parseArgs(process.argv);
  const root = args.get('--root') || DEFAULT_ROOT;
  const documentType = args.get('--document-type') || DEFAULT_DOCUMENT_TYPE;
  const academicYear = args.get('--academic-year') || null;
  const dryRun = Boolean(args.get('--dry-run'));
  const useGemini = !args.get('--no-gemini');
  const geminiMaxBytes = Number(args.get('--gemini-max-bytes') || DEFAULT_GEMINI_MAX_BYTES);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHANNEL_ID;
  const geminiKey = process.env.GEMINI_API_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!telegramToken || !telegramChatId) {
    throw new Error('Missing Telegram env: TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const files = walkFiles(root);
  if (files.length === 0) {
    console.log('No files found in', root);
    return;
  }

  console.log(`Found ${files.length} file(s) under ${root}`);

  for (const filePath of files) {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const mimeType = getMimeType(filePath);
    const originalFileName = path.basename(filePath);
    const subjectFromPath = inferSubjectFromPath(filePath);

    const buffer = fs.readFileSync(filePath);
    const fallbackTitle = toUpperVi(titleFromFileName(originalFileName));

    let aiTitle = fallbackTitle;
    if (useGemini && geminiKey && buffer.length <= geminiMaxBytes) {
      try {
        const raw = await callGeminiTitle({
          apiKey: geminiKey,
          buffer,
          mimeType,
          fallbackTitle,
        });
        aiTitle = toUpperVi(raw);
      } catch (err) {
        console.warn(`[Gemini] Fallback to filename for ${originalFileName}: ${err.message}`);
      }
    } else if (useGemini && geminiKey && buffer.length > geminiMaxBytes) {
      console.warn(`[Gemini] Skip large file (${buffer.length} bytes): ${originalFileName}`);
    }

    const safeTitle = slugifyFileName(aiTitle || fallbackTitle);
    const ext = path.extname(originalFileName);
    const baseName = safeTitle || path.basename(originalFileName, ext);
    const newFilePath = getUniqueFilePath(path.dirname(filePath), baseName, ext, filePath);

    if (newFilePath !== filePath && !dryRun) {
      fs.renameSync(filePath, newFilePath);
    }

    const finalPath = newFilePath !== filePath ? newFilePath : filePath;
    const finalName = path.basename(finalPath);
    const finalBuffer = newFilePath !== filePath && !dryRun ? fs.readFileSync(finalPath) : buffer;

    const { subject, majorId } = await resolveSubjectInfo(supabase, subjectFromPath);
    const fallbackDocType = normalizeDocumentType(documentType, DEFAULT_DOCUMENT_TYPE);

    let aiDocType = fallbackDocType;
    if (useGemini && geminiKey && buffer.length <= geminiMaxBytes) {
      try {
        aiDocType = await callGeminiDocumentType({
          apiKey: geminiKey,
          buffer,
          mimeType,
          fallbackType: fallbackDocType,
        });
      } catch (err) {
        console.warn(`[Gemini] Fallback document_type for ${originalFileName}: ${err.message}`);
      }
    }

    console.log(`\nProcessing: ${finalName}`);
    console.log(`  Subject: ${subject?.name || subjectFromPath || 'N/A'}`);
    console.log(`  Title: ${aiTitle}`);
    console.log(`  Document type: ${aiDocType}`);

    if (dryRun) {
      console.log('  Dry-run: skip upload and database insert.');
      continue;
    }

    const uploadResult = await uploadFileChunked({
      token: telegramToken,
      chatId: telegramChatId,
      buffer: finalBuffer,
      fileName: finalName,
      mimeType,
      caption: aiTitle,
    });

    const insertPayload = {
      title: aiTitle,
      document_type: aiDocType,
      major_id: majorId,
      subject_id: subject?.id || null,
      subject_name: subject?.name || (subjectFromPath ? toUpperVi(subjectFromPath) : null),
      academic_year: academicYear,
      lecturer_name: null,
      faculty: null,
      description: null,
      storage_provider: 'telegram',
      file_path: uploadResult.file_path,
      file_name: uploadResult.file_name,
      file_size: uploadResult.file_size,
      mime_type: uploadResult.mime_type,
      status: 'APPROVED',
      view_count: 0,
      download_count: 0,
      approved_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase insert error: ${error.message}`);
    }

    console.log(`  Uploaded and approved: ${data?.id || 'OK'}`);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
