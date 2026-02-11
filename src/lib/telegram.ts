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
    console.error('Telegram API error:', result);
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
    console.error('Telegram deleteMessage error:', result);
    // Don't throw — deletion failure shouldn't block the reject flow
    return false;
  }
  return true;
}

/**
 * Parse file_path stored as "file_id|message_id" format
 */
export function parseTelegramFilePath(filePath: string): {
  fileId: string;
  messageId: number | null;
} {
  const parts = filePath.split('|');
  return {
    fileId: parts[0],
    messageId: parts[1] ? parseInt(parts[1], 10) : null,
  };
}
