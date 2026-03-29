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
// So we chunk at 4MB to stay safe below the limit
const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB per chunk
const VERCEL_LIMIT = 4.5 * 1024 * 1024; // 4.5MB Vercel request limit
const TELEGRAM_LIMIT = 20 * 1024 * 1024; // 20MB Telegram file limit

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
 * Upload chunk to Telegram
 */
export async function uploadChunkToTelegram(
  chunk: FileChunk,
  chatId: string,
  onProgress?: (progress: number) => void
): Promise<{ file_id: string; message_id: number; file_name: string; file_size: number; chunk_info: string }> {
  return new Promise((resolve, reject) => {
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
    xhr.addEventListener('load', () => {
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
      } else if (xhr.status === 429) {
        // Rate limit exceeded
        const retryAfter = xhr.getResponseHeader('Retry-After') || 'a few seconds';
        const errorData = JSON.parse(xhr.responseText);
        reject(new Error(`${errorData.error} (Vui lòng chờ ${retryAfter} giây)`));
      } else {
        const error = xhr.responseText;
        reject(new Error(`Upload failed with status ${xhr.status}: ${error}`));
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
 * Upload file with automatic chunking
 * Returns array of file_ids for each chunk (if chunked) or single file_id (if not)
 */
export async function uploadFileWithChunking(
  file: File,
  chatId?: string,
  onProgress?: (progress: number, message?: string) => void
): Promise<string[]> {
  const chunks = splitFileIntoChunks(file);
  const fileIds: string[] = [];
  const messageIds: (number | null)[] = [];

  if (onProgress) {
    if (chunks.length > 1) {
      onProgress(0, `Chia nhỏ file thành ${chunks.length} phần...`);
    } else {
      onProgress(0, `Đang tải lên...`);
    }
  }

  // Upload each chunk
  for (const chunk of chunks) {
    try {
      const result = await uploadChunkToTelegram(chunk, chatId || '', onProgress);
      fileIds.push(result.file_id);
      messageIds.push(result.message_id || null);

      if (onProgress) {
        const progress = ((chunk.index + 1) / chunks.length) * 100;
        onProgress(
          Math.round(progress),
          `Đã upload ${chunk.index + 1}/${chunks.length} phần`
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to upload chunk ${chunk.index + 1}/${chunks.length}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  // Format for chunked files: "chunk:fileId1|msgId1,fileId2|msgId2,..."
  if (fileIds.length > 1) {
    const formatted = fileIds.map((fid, i) => `${fid}|${messageIds[i] || ''}`);
    return formatted;
  }

  return fileIds;
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
