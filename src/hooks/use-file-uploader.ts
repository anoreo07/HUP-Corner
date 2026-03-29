'use client';

import { useState, useCallback } from 'react';

export interface UseFileUploaderOptions {
  maxSize?: number; // bytes
  allowedTypes?: string[];
}

export interface FileUploadResult {
  file_id: string;
  file_unique_id: string;
  file_name: string;
  file_size: number;
  message_id: number;
}

export interface FileUploadState {
  fileName: string;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
  result?: FileUploadResult;
}

const DEFAULT_OPTIONS: UseFileUploaderOptions = {
  maxSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'video/mp4',
    'audio/mpeg',
  ],
};

/**
 * useFileUploader Hook
 *
 * Usage:
 * ```
 * const { uploads, uploadFile } = useFileUploader();
 *
 * const handleUpload = async (file: File) => {
 *   const result = await uploadFile(file);
 *   console.log(result);
 * };
 * ```
 */
export function useFileUploader(options: UseFileUploaderOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [uploads, setUploads] = useState<FileUploadState[]>([]);

  const validateFile = useCallback(
    (file: File): { valid: boolean; message?: string } => {
      if (file.size > opts.maxSize!) {
        return {
          valid: false,
          message: `File quá lớn. Tối đa ${(opts.maxSize! / 1024 / 1024).toFixed(0)}MB (file: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        };
      }

      if (!opts.allowedTypes!.includes(file.type)) {
        return {
          valid: false,
          message: `Định dạng không hỗ trợ: ${file.type}`,
        };
      }

      return { valid: true };
    },
    [opts]
  );

  const uploadFile = useCallback(
    async (file: File, chatId?: string): Promise<FileUploadResult | null> => {
      const validation = validateFile(file);
      if (!validation.valid) {
        const uploadState: FileUploadState = {
          fileName: file.name,
          progress: 0,
          status: 'error',
          message: validation.message,
        };
        setUploads((prev) => [...prev, uploadState]);
        return null;
      }

      const uploadIndex = uploads.length;
      setUploads((prev) => [
        ...prev,
        {
          fileName: file.name,
          progress: 0,
          status: 'uploading',
        },
      ]);

      return new Promise<FileUploadResult | null>((resolve) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploads((prev) => {
              const updated = [...prev];
              updated[uploadIndex] = {
                ...updated[uploadIndex],
                progress: Math.round(percentComplete),
              };
              return updated;
            });
          }
        });

        xhr.addEventListener('load', () => {
          try {
            const response = JSON.parse(xhr.responseText);

            if (xhr.status === 200) {
              setUploads((prev) => {
                const updated = [...prev];
                updated[uploadIndex] = {
                  ...updated[uploadIndex],
                  status: 'success',
                  progress: 100,
                  message: `Uploaded: ${response.file_name}`,
                  result: response,
                };
                return updated;
              });
              resolve(response);
            } else {
              throw new Error(response.error || 'Upload failed');
            }
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Upload failed';
            setUploads((prev) => {
              const updated = [...prev];
              updated[uploadIndex] = {
                ...updated[uploadIndex],
                status: 'error',
                message,
              };
              return updated;
            });
            resolve(null);
          }
        });

        xhr.addEventListener('error', () => {
          setUploads((prev) => {
            const updated = [...prev];
            updated[uploadIndex] = {
              ...updated[uploadIndex],
              status: 'error',
              message: 'Network error',
            };
            return updated;
          });
          resolve(null);
        });

        const formData = new FormData();
        formData.append('document', file);
        
        if (chatId) {
          formData.append('chat_id', chatId);
        } else if (process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_ID) {
          formData.append('chat_id', process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_ID);
        }

        formData.append(
          'caption',
          `📄 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`
        );

        xhr.open('POST', '/api/telegram/upload-proxy');
        xhr.send(formData);
      });
    },
    [validateFile, uploads.length]
  );

  const clearUploads = useCallback(() => {
    setUploads([]);
  }, []);

  const removeUpload = useCallback((index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    uploads,
    uploadFile,
    clearUploads,
    removeUpload,
  };
}
