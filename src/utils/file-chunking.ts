'use client';

/**
 * File Chunking Utility
 * 
 * Chia nhỏ file lớn thành nhiều chunks để bypass Telegram 20MB limit
 * Mỗi chunk ~18MB để có buffer, sau khi upload sẽ gộp lại
 */

export interface FileChunk {
  index: number;
  blob: Blob;
  fileName: string;
  totalChunks: number;
}

// IMPORTANT: Vercel request body limit is ~4.5MB
// So we chunk at 4MB to stay safe below the limit for the proxy
const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB per chunk
const VERCEL_LIMIT = 4.5 * 1024 * 1024; // 4.5MB Vercel request limit
const TELEGRAM_LIMIT = 20 * 1024 * 1024; // 20MB Telegram file limit
const MAX_CONCURRENT_UPLOADS = 3; // Số lượng chunk upload song song tối đa để tránh rate limit

/**
 * Check if file needs to be chunked
 * File should be chunked if it exceeds Vercel limit (4.5MB)
 */
export function needsChunking(fileSize: number): boolean {
  return fileSize > VERCEL_LIMIT;
}

/**
 * Calculate number of chunks needed
 */
export function calculateChunks(fileSize: number): number {
  if (fileSize <= CHUNK_SIZE) return 1;
  return Math.ceil(fileSize / CHUNK_SIZE);
}

/**
 * Split file into chunks
 */
export function splitFileIntoChunks(file: File): FileChunk[] {
  const chunks: FileChunk[] = [];
  const totalChunks = calculateChunks(file.size);

  if (totalChunks === 1) {
    // No chunking needed
    chunks.push({
      index: 0,
      blob: file,
      fileName: file.name,
      totalChunks: 1,
    });
    return chunks;
  }

  // Split into multiple chunks
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const blob = file.slice(start, end);

    // Generate chunk filename: original_name.chunk1of5
    const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const chunkFileName = `${baseName}.chunk${i + 1}of${totalChunks}${extension}`;

    chunks.push({
      index: i,
      blob: new File([blob], chunkFileName, { type: file.type }),
      fileName: chunkFileName,
      totalChunks,
    });
  }

  return chunks;
}

/**
 * Upload chunk to Telegram with automatic retry on rate limit
 */
export async function uploadChunkToTelegram(
  chunk: FileChunk,
  chatId: string,
  onProgress?: (progress: number) => void,
  retryCount = 0
): Promise<{ file_id: string; message_id: number; file_name: string; file_size: number; chunk_info: string }> {
  const MAX_RETRIES = 3;

  return new Promise((resolve, reject) => {
    // Validate chatId before proceeding
    if (!chatId || chatId.trim() === '') {
      reject(new Error('Telegram Channel ID is not configured. Please check your environment variables.'));
      return;
    }

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        if (onProgress) {
          // Adjust progress based on chunk index
          const totalProgress = ((chunk.index / chunk.totalChunks) * 100) +
            ((percentComplete / chunk.totalChunks));
          onProgress(Math.round(totalProgress));
        }
      }
    });

    // Handle completion
    xhr.addEventListener('load', async () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve({
            file_id: result.file_id,
            message_id: result.message_id || 0,
            file_name: result.file_name,
            file_size: result.file_size,
            chunk_info: `Chunk ${chunk.index + 1}/${chunk.totalChunks}`,
          });
        } catch (err) {
          reject(new Error(`Failed to parse response: ${xhr.responseText}`));
        }
      } else if (xhr.status === 429 && retryCount < MAX_RETRIES) {
        // Rate limit exceeded - Wait and Retry
        const retryAfterHeader = xhr.getResponseHeader('Retry-After');
        const waitMs = (retryAfterHeader ? parseInt(retryAfterHeader, 10) : 5) * 1000;

        // Rate limit hit for chunk retry logic

        setTimeout(async () => {
          try {
            const result = await uploadChunkToTelegram(chunk, chatId, onProgress, retryCount + 1);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        }, waitMs);
      } else if (xhr.status === 429) {
        const retryAfter = xhr.getResponseHeader('Retry-After') || 'a few seconds';
        reject(new Error(`Quá tải yêu cầu (429). Vui lòng chờ ${retryAfter} giây trước khi thử lại.`));
      } else if (xhr.status === 400) {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(`Invalid request: ${errorData.error || xhr.responseText}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      } else {
        const error = xhr.responseText || `HTTP ${xhr.status}`;
        reject(new Error(`Upload failed: ${error}`));
      }
    });

    // Handle error
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during chunk upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Chunk upload cancelled'));
    });

    // Prepare FormData
    const formData = new FormData();
    formData.append('document', chunk.blob);
    formData.append('chat_id', chatId);
    formData.append('caption', `📦 ${chunk.fileName}`);

    // Add chunk info for backend tracking
    formData.append('chunk_index', String(chunk.index));
    formData.append('total_chunks', String(chunk.totalChunks));
    formData.append('original_file_size', String(chunk.blob.size));

    // Send to proxy endpoint
    xhr.open('POST', '/api/telegram/upload-proxy');
    xhr.send(formData);
  });
}

/**
 * Upload file with automatic parallel chunking
 * Returns array of file_ids for each chunk (if chunked) or single file_id (if not)
 */
export async function uploadFileWithChunking(
  file: File,
  chatId?: string,
  onProgress?: (progress: number, message?: string) => void
): Promise<string[]> {
  const chunks = splitFileIntoChunks(file);
  const results: { file_id: string; message_id: number | null; index: number }[] = [];
  let completedCount = 0;

  if (onProgress) {
    if (chunks.length > 1) {
      onProgress(0, `Chia nhỏ file thành ${chunks.length} phần...`);
    } else {
      onProgress(0, `Đang tải lên...`);
    }
  }

  // Helper function to upload with a pool
  const uploadChunk = async (chunk: FileChunk) => {
    try {
      const result = await uploadChunkToTelegram(chunk, chatId || '', (percent) => {
        // Individual chunk progress is handled within uploadChunkToTelegram
        // We can update global progress here if needed
      });

      results.push({
        file_id: result.file_id,
        message_id: result.message_id || null,
        index: chunk.index
      });

      completedCount++;
      if (onProgress) {
        const globalProgress = (completedCount / chunks.length) * 100;
        onProgress(
          Math.round(globalProgress),
          `Đã upload ${completedCount}/${chunks.length} phần`
        );
      }
    } catch (error) {
      throw error;
    }
  };

  // Run uploads in parallel with concurrency limit
  const queue = [...chunks];
  const workers: Promise<void>[] = [];

  for (let i = 0; i < Math.min(MAX_CONCURRENT_UPLOADS, chunks.length); i++) {
    workers.push((async () => {
      while (queue.length > 0) {
        const chunk = queue.shift();
        if (chunk) await uploadChunk(chunk);
      }
    })());
  }

  await Promise.all(workers);

  // Sort results by index to ensure correct order
  results.sort((a, b) => a.index - b.index);
  const formattedResults = results.map(r => `${r.file_id}|${r.message_id || ''}`);

  // Format for chunked files: "chunk:fileId1|msgId1,fileId2|msgId2,..."
  if (formattedResults.length > 1) {
    // Note: useFileUploader will add the "chunk:" prefix
    return formattedResults;
  }

  return formattedResults;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}


/**
 * Parse the composite file path
 */
export function parseChunkedPath(filePath: string) {
  if (filePath.startsWith('chunk:')) {
    const chunkData = filePath.slice(6);
    return chunkData.split(',').map(part => {
      const [fileId, messageId] = part.split('|');
      return { fileId, messageId };
    });
  }
  const [fileId, messageId] = filePath.split('|');
  return [{ fileId, messageId }];
}

/**
 * Download file using parallel chunking and client-side merging
 */
export async function downloadFileParallel(
  filePath: string,
  fileName: string,
  onProgress?: (progress: number, message?: string) => void
) {
  const chunks = parseChunkedPath(filePath);
  const totalChunks = chunks.length;

  if (onProgress) {
    onProgress(0, totalChunks > 1 ? `Đang chuẩn bị tải ${totalChunks} phần...` : 'Đang chuẩn bị tải...');
  }

  try {
    // Download all chunks in parallel
    const downloadPromises = chunks.map(async (chunk, index) => {
      const response = await fetch(`/api/telegram/download-chunk?fileId=${chunk.fileId}`);
      if (!response.ok) throw new Error(`Failed to download chunk ${index + 1}`);

      // We can't easily track progress of individual fetches with fetch API 
      // without using ReadableStream, so we'll just track completed chunks
      const blob = await response.blob();

      if (onProgress) {
        // Increment progress as chunks complete
        // This is a simplified progress tracking
        onProgress(Math.round(((index + 1) / totalChunks) * 100));
      }

      return blob;
    });

    const blobs = await Promise.all(downloadPromises);

    if (onProgress) onProgress(100, 'Đang hợp nhất dữ liệu...');

    // Merge all chunks into one blob
    const finalBlob = new Blob(blobs, { type: 'application/octet-stream' });

    // Trigger download
    const url = window.URL.createObjectURL(finalBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    if (onProgress) onProgress(100, 'Tải về hoàn tất!');
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Get chunk info string
 */
export function getChunkInfo(fileSize: number): string {
  if (!needsChunking(fileSize)) {
    return 'File sẽ được upload 1 phần';
  }

  const chunks = calculateChunks(fileSize);
  const chunkSize = Math.ceil(fileSize / chunks);

  return `File sẽ được chia thành ${chunks} phần (mỗi phần ~${formatFileSize(chunkSize)})`;
}
