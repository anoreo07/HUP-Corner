/**
 * Telegram Bot API helper functions
 * Used for uploading/downloading files via Telegram channel as storage
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '';
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const TELEGRAM_FILE_BASE = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramFileResult {
  file_id: string;
  file_unique_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  message_id: number;
}

export interface TelegramGetFileResult {
  file_id: string;
  file_unique_id: string;
  file_size: number;
  file_path: string;
}

/**
 * Upload a file to a Telegram channel using sendDocument
 */
export async function uploadFileToTelegram(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  caption?: string
): Promise<TelegramFileResult> {
  const formData = new FormData();
  const uint8 = new Uint8Array(fileBuffer);
  const blob = new Blob([uint8], { type: mimeType });
  formData.append('chat_id', TELEGRAM_CHANNEL_ID);
  formData.append('document', blob, fileName);
  if (caption) {
    formData.append('caption', caption);
  }

  const response = await fetch(`${TELEGRAM_API_BASE}/sendDocument`, {
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
    file_size: doc.file_size || 0,
    mime_type: doc.mime_type || mimeType,
    message_id: result.result.message_id,
  };
}

/**
 * Get file info from Telegram using file_id
 */
export async function getFileFromTelegram(fileId: string): Promise<TelegramGetFileResult> {
  const response = await fetch(`${TELEGRAM_API_BASE}/getFile?file_id=${fileId}`);
  const result = await response.json();

  if (!result.ok) {
    throw new Error(`Telegram getFile error: ${result.description || 'Unknown error'}`);
  }

  return result.result;
}

/**
 * Get download URL for a Telegram file
 */
export async function getTelegramFileDownloadUrl(fileId: string): Promise<string> {
  const fileInfo = await getFileFromTelegram(fileId);
  return `${TELEGRAM_FILE_BASE}/${fileInfo.file_path}`;
}

/**
 * Download file content from Telegram
 */
export async function downloadFileFromTelegram(fileId: string): Promise<{
  buffer: Buffer;
  url: string;
}> {
  const downloadUrl = await getTelegramFileDownloadUrl(fileId);
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error(`Failed to download file from Telegram: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    url: downloadUrl,
  };
}

/**
 * Delete a message (file) from Telegram channel
 */
export async function deleteMessageFromTelegram(messageId: number): Promise<boolean> {
  const response = await fetch(
    `${TELEGRAM_API_BASE}/deleteMessage?chat_id=${TELEGRAM_CHANNEL_ID}&message_id=${messageId}`
  );
  const result = await response.json();

  if (!result.ok) {
    // Don't throw — deletion failure shouldn't block the reject flow
    return false;
  }
  return true;
}

/**
 * Parse file_path stored as "file_id|message_id" format
 * Also supports chunked format: "chunk:file_id1|msg1,file_id2|msg2,..."
 */
export function parseTelegramFilePath(filePath: string): {
  fileId: string;
  messageId: number | null;
  isChunked: boolean;
  chunks: { fileId: string; messageId: number | null }[];
} {
  // Chunked file format: "chunk:fileId1|msgId1,fileId2|msgId2,..."
  if (filePath.startsWith('chunk:')) {
    const chunkData = filePath.slice(6); // remove "chunk:" prefix
    const chunks = chunkData.split(',').map((part) => {
      const [fid, mid] = part.split('|');
      return {
        fileId: fid,
        messageId: mid ? parseInt(mid, 10) : null,
      };
    });
    return {
      fileId: chunks[0].fileId,
      messageId: chunks[0].messageId,
      isChunked: true,
      chunks,
    };
  }

  // Regular single-file format: "file_id|message_id"
  const parts = filePath.split('|');
  return {
    fileId: parts[0],
    messageId: parts[1] ? parseInt(parts[1], 10) : null,
    isChunked: false,
    chunks: [
      {
        fileId: parts[0],
        messageId: parts[1] ? parseInt(parts[1], 10) : null,
      },
    ],
  };
}

// Telegram Bot API getFile limit: 20MB
const TELEGRAM_CHUNK_SIZE = 19 * 1024 * 1024; // 19MB to be safe

/**
 * Upload a large file to Telegram by splitting into chunks.
 * Each chunk is uploaded as a separate document.
 * Returns a composite file_path string: "chunk:fileId1|msgId1,fileId2|msgId2,..."
 */
export async function uploadFileChunked(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  caption?: string
): Promise<{
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}> {
  const totalSize = fileBuffer.length;

  // If small enough, use single upload
  if (totalSize <= TELEGRAM_CHUNK_SIZE) {
    const result = await uploadFileToTelegram(fileBuffer, fileName, mimeType, caption);
    return {
      file_path: `${result.file_id}|${result.message_id}`,
      file_name: result.file_name,
      file_size: result.file_size,
      mime_type: result.mime_type,
    };
  }

  // Split into chunks
  const chunkCount = Math.ceil(totalSize / TELEGRAM_CHUNK_SIZE);
  const chunkParts: string[] = [];

  for (let i = 0; i < chunkCount; i++) {
    const start = i * TELEGRAM_CHUNK_SIZE;
    const end = Math.min(start + TELEGRAM_CHUNK_SIZE, totalSize);
    const chunkBuffer = fileBuffer.subarray(start, end);

    const chunkName = `${fileName}.part${i + 1}of${chunkCount}`;
    const chunkCaption =
      i === 0
        ? `📄 ${caption || fileName} (phần ${i + 1}/${chunkCount})`
        : `📄 phần ${i + 1}/${chunkCount}`;

    const result = await uploadFileToTelegram(
      Buffer.from(chunkBuffer),
      chunkName,
      'application/octet-stream',
      chunkCaption
    );

    chunkParts.push(`${result.file_id}|${result.message_id}`);
  }

  return {
    file_path: `chunk:${chunkParts.join(',')}`,
    file_name: fileName,
    file_size: totalSize,
    mime_type: mimeType,
  };
}

/**
 * Error thrown when a legacy (non-chunked) file exceeds Telegram's 20MB getFile limit.
 */
export class TelegramFileTooLargeError extends Error {
  code = 'TELEGRAM_FILE_TOO_LARGE';
  constructor(message?: string) {
    super(
      message ||
        'File quá lớn (>20 MB). File này được tải lên trước khi hỗ trợ chia nhỏ file. Vui lòng liên hệ admin để tải lên lại.'
    );
    this.name = 'TelegramFileTooLargeError';
  }
}

/**
 * Download a file from Telegram, reassembling chunks if needed.
 * Throws TelegramFileTooLargeError for legacy files >20MB.
 */
export async function downloadFileAuto(filePath: string): Promise<{
  buffer: Buffer;
}> {
  const parsed = parseTelegramFilePath(filePath);

  if (!parsed.isChunked) {
    // Single file download — may fail for legacy >20MB files
    try {
      const { buffer } = await downloadFileFromTelegram(parsed.fileId);
      return { buffer };
    } catch (err: any) {
      if (
        err.message &&
        (err.message.includes('file is too big') ||
          err.message.includes('file_too_big'))
      ) {
        throw new TelegramFileTooLargeError();
      }
      throw err;
    }
  }

  // Download all chunks in parallel for faster performance
  const downloadPromises = parsed.chunks.map(chunk => 
    downloadFileFromTelegram(chunk.fileId)
      .then(({ buffer }) => buffer)
      .catch(err => {
        throw err;
      })
  );

  const buffers = await Promise.all(downloadPromises);

  return { buffer: Buffer.concat(buffers as any) };
}
