#!/usr/bin/env node

/*
  Auto upload documents to Telegram storage and Supabase.
  - Uses Ollama (optional) to generate an uppercase Vietnamese title (fallback to filename).
  - Renames the local file to the AI title before upload.
  - Extracts category from LT (Theory) or TT (Practical) folder structure.
  - Inserts directly as APPROVED (admin flow bypass).

  Usage:
    node upload_scripts/upload-documents.js [--root upload_scripts/files] [--document-type OTHER]
      [--academic-year "2023-2024"] [--dry-run] [--use-ollama] [--ollama-max-bytes 8000000]

  Note: Ollama integration is disabled by default. Use --use-ollama to enable it.
*/

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');

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
    case '.txt':
      return 'text/plain';
    case '.md':
      return 'text/markdown';
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

async function extractTextFromPdf(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text || '';
  } catch (err) {
    console.warn(`[Text Extraction] Failed to extract text from PDF: ${err.message}`);
    return '';
  }
}

async function extractTextFromDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (err) {
    console.warn(`[Text Extraction] Failed to extract text from DOCX: ${err.message}`);
    return '';
  }
}

async function callOllamaMetadata({ url, model, buffer, mimeType, fileName, fallbackTitle, fallbackType }) {
  if (!url) {
    return {
      title: fallbackTitle,
      document_type: fallbackType,
      academic_year: null,
      lecturer_name: null,
      faculty: null,
      description: null
    };
  }

  let extractedText = '';
  try {
    const ext = path.extname(fileName).toLowerCase();
    if (mimeType === 'application/pdf' || ext === '.pdf') {
      extractedText = await extractTextFromPdf(buffer);
    } else if (mimeType.includes('word') || mimeType.includes('officedocument.wordprocessingml') || ext === '.docx' || ext === '.doc') {
      extractedText = await extractTextFromDocx(buffer);
    } else if (mimeType.startsWith('text/') || mimeType === 'application/json' || ext === '.txt' || ext === '.md' || ext === '.json') {
      extractedText = buffer.toString('utf8');
    }
  } catch (err) {
    console.warn(`[Ollama] Failed to extract text: ${err.message}`);
    extractedText = '';
  }

  // Prepare simplified prompt for better JSON response
  const documentInfo = extractedText.slice(0, 2000) || `File name: ${fileName}`;
  
  const prompt = `Analyze this document and return ONLY a valid JSON object with these fields:
{
  "title": "Concise Vietnamese title in ALL CAPS (or null)",
  "document_type": "One of: EXAM, SLIDE, TEXTBOOK, OTHER (or OTHER if unknown)",
  "academic_year": "2023-2024 format if mentioned (or null)",
  "lecturer_name": "Full name if mentioned (or null)",
  "faculty": "Faculty/Department name (or null)",
  "description": "1-2 sentence description (or null)"
}

Document info:
${documentInfo}`;

  try {
    const res = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ollama HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const responseText = data?.message?.content || '';
    
    if (!responseText) {
      console.warn(`[Ollama] Empty response from Ollama`);
      throw new Error('Empty response');
    }

    // Extract JSON from response (might have extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(`[Ollama] No JSON found in response: ${responseText.slice(0, 100)}`);
      throw new Error('No JSON in response');
    }

    const metadata = JSON.parse(jsonMatch[0]);
    return {
      title: metadata.title ? String(metadata.title).trim() : fallbackTitle,
      document_type: normalizeDocumentType(metadata.document_type, fallbackType),
      academic_year: metadata.academic_year || null,
      lecturer_name: metadata.lecturer_name || null,
      faculty: metadata.faculty || null,
      description: metadata.description || null
    };
  } catch (err) {
    console.warn(`[Ollama] Failed to get metadata: ${err.message}`);
    return {
      title: fallbackTitle,
      document_type: fallbackType,
      academic_year: null,
      lecturer_name: null,
      faculty: null,
      description: null
    };
  }
}

async function callOllamaTitle({ url, model, buffer, mimeType, fileName, fallbackTitle }) {
  const metadata = await callOllamaMetadata({ url, model, buffer, mimeType, fileName, fallbackTitle, fallbackType: 'OTHER' });
  return metadata.title;
}

async function callOllamaDocumentType({ url, model, buffer, mimeType, fileName, fallbackType }) {
  const metadata = await callOllamaMetadata({ url, model, buffer, mimeType, fileName, fallbackTitle: 'Unknown', fallbackType });
  return metadata.document_type;
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

function inferSubjectFromPath(filePath, rootPath) {
  const parts = filePath.split(path.sep);
  const idx = parts.lastIndexOf('subject');
  if (idx >= 0 && parts[idx + 1]) {
    return parts[idx + 1];
  }
  if (rootPath) {
    const relative = path.relative(rootPath, filePath);
    const relativeParts = relative.split(path.sep);
    if (relativeParts.length > 1) {
      return relativeParts[0];
    }
  }
  return null;
}

function inferCategoryFromPath(filePath, rootPath) {
  const parts = filePath.split(path.sep);
  
  // Look for LT or TT folder anywhere in the path
  for (const part of parts) {
    if (part === 'LT' || part.toUpperCase() === 'LT') {
      return 'THEORY';
    }
    if (part === 'TT' || part.toUpperCase() === 'TT') {
      return 'PRACTICAL';
    }
  }
  
  // Fallback: try to find category based on relative path from root
  if (rootPath) {
    const relative = path.relative(rootPath, filePath);
    const relativeParts = relative.split(path.sep);
    // Check second level (after subject folder)
    if (relativeParts.length > 1) {
      const categoryPart = relativeParts[1];
      if (categoryPart === 'LT' || categoryPart.toUpperCase() === 'LT') {
        return 'THEORY';
      }
      if (categoryPart === 'TT' || categoryPart.toUpperCase() === 'TT') {
        return 'PRACTICAL';
      }
    }
  }
  
  return null;
}

async function resolveSubjectInfo(supabase, subjectName) {
  if (!subjectName) return { subject: null, majorId: null };

  const { data: codeMatch, error: codeError } = await supabase
    .from('subjects')
    .select('*')
    .ilike('code', subjectName)
    .limit(1);

  if (!codeError && codeMatch && codeMatch.length > 0) {
    return { subject: codeMatch[0], majorId: codeMatch[0].major_id || null };
  }

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
  const useOllama = Boolean(args.get('--use-ollama'));
  const ollamaMaxBytes = Number(args.get('--ollama-max-bytes') || args.get('--gemini-max-bytes') || DEFAULT_GEMINI_MAX_BYTES);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHANNEL_ID;
  const ollamaApiUrl = process.env.OLLAMA_API_URL || 'http://192.168.1.231:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'gemma3:4b';

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
  if (useOllama) {
    console.log(`Using Ollama API URL: ${ollamaApiUrl} with model: ${ollamaModel}`);
  }

  for (const filePath of files) {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const mimeType = getMimeType(filePath);
    const originalFileName = path.basename(filePath);
    const subjectFromPath = inferSubjectFromPath(filePath, root);
    const categoryFromPath = inferCategoryFromPath(filePath, root);

    const buffer = fs.readFileSync(filePath);
    const fallbackTitle = toUpperVi(titleFromFileName(originalFileName));

    let aiTitle = fallbackTitle;
    if (useOllama && ollamaApiUrl && buffer.length <= ollamaMaxBytes) {
      try {
        const raw = await callOllamaTitle({
          url: ollamaApiUrl,
          model: ollamaModel,
          buffer,
          mimeType,
          fileName: originalFileName,
          fallbackTitle,
        });
        aiTitle = toUpperVi(raw);
      } catch (err) {
        console.warn(`[Ollama] Fallback to filename for ${originalFileName}: ${err.message}`);
      }
    } else if (useOllama && ollamaApiUrl && buffer.length > ollamaMaxBytes) {
      console.warn(`[Ollama] Skip large file (${buffer.length} bytes): ${originalFileName}`);
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
    if (useOllama && ollamaApiUrl && buffer.length <= ollamaMaxBytes) {
      try {
        aiDocType = await callOllamaDocumentType({
          url: ollamaApiUrl,
          model: ollamaModel,
          buffer,
          mimeType,
          fileName: originalFileName,
          fallbackType: fallbackDocType,
        });
      } catch (err) {
        console.warn(`[Ollama] Fallback document_type for ${originalFileName}: ${err.message}`);
      }
    }

    console.log(`\nProcessing: ${finalName}`);
    console.log(`  Subject: ${subject?.name || subjectFromPath || 'N/A'}`);
    console.log(`  Category: ${categoryFromPath || 'N/A'}`);
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
      category: categoryFromPath,
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
