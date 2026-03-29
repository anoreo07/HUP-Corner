'use client';

import { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  message?: string;
}

// Telegram File Uploader Component
export function TelegramFileUploader() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; message?: string } => {
    const maxSize = 20 * 1024 * 1024; 
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'video/mp4',
      'audio/mpeg',
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        message: `File quá lớn. Tối đa 20MB (file của bạn: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: `Định dạng file không được hỗ trợ: ${file.type}`,
      };
    }

    return { valid: true };
  };

  const uploadFile = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploads((prev) => [
        ...prev,
        {
          fileName: file.name,
          progress: 0,
          status: 'error',
          message: validation.message,
        },
      ]);
      return;
    }

    // Thêm upload vào list
    const uploadIndex = uploads.length;
    setUploads((prev) => [
      ...prev,
      {
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      },
    ]);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
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

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            setUploads((prev) => {
              const updated = [...prev];
              updated[uploadIndex] = {
                ...updated[uploadIndex],
                status: 'success',
                progress: 100,
                message: `File ID: ${result.file_id.substring(0, 20)}...`,
              };
              return updated;
            });
            resolve();
          } else {
            throw new Error(`HTTP ${xhr.status}: ${xhr.responseText}`);
          }
        });

        // Handle error
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        // Prepare FormData
        const formData = new FormData();
        formData.append('document', file);
        formData.append('chat_id', process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_ID || '');
        formData.append(
          'caption',
          `📄 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`
        );

        // Send to proxy endpoint (NOT directly to Telegram!)
        xhr.open('POST', '/api/telegram/upload-proxy');
        xhr.send(formData);
      });
    } catch (error) {
      setUploads((prev) => {
        const updated = [...prev];
        updated[uploadIndex] = {
          ...updated[uploadIndex],
          status: 'error',
          message: error instanceof Error ? error.message : 'Upload failed',
        };
        return updated;
      });
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="space-y-3">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              Kéo file vào đây hoặc{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                chọn file
              </button>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tối đa 20MB (PDF, DOC, XLS, PPT, ảnh, video, âm thanh)
            </p>
          </div>
        </div>
      </div>

      {/* Security Warning */}
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <p className="font-semibold">⚠️ Lưu ý bảo mật:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Bot Token được bảo vệ ở server-side (không lộ ở client)</li>
            <li>Request được proxy qua /api/telegram/upload-proxy</li>
            <li>File gửi trực tiếp từ browser = bypass giới hạn Vercel 413</li>
          </ul>
        </div>
      </div>

      {/* Upload Progress List */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Lịch sử upload
          </h3>
          {uploads.map((upload, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {upload.fileName}
                  </p>

                  {/* Progress Bar */}
                  {upload.status === 'uploading' && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Đang tải lên...
                        </span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {upload.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Message */}
                  {upload.message && (
                    <p
                      className={`mt-2 text-xs ${
                        upload.status === 'success'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {upload.message}
                    </p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {upload.status === 'uploading' && (
                    <div className="animate-spin">
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  {upload.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                  {upload.status === 'error' && (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
