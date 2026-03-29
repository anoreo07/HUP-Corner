'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function DownloadProgressPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Đang chuẩn bị tệp...');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Get file ID from URL
    const fileId = searchParams.get('fileId');
    const fileName = searchParams.get('fileName') || 'file';

    if (!fileId) {
      setMessage('Lỗi: Không có file ID');
      return;
    }

    // Simulate download progress
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(95, (elapsed / 15000) * 100); // Max 95% until complete

      if (newProgress >= 90) {
        setMessage('Đang hoàn thành...');
      } else if (newProgress >= 70) {
        setMessage('Đang xử lý tệp...');
      } else if (newProgress >= 40) {
        setMessage('Đang tải xuống...');
      }

      setProgress(Math.round(newProgress));
    }, 100);

    // Actually download the file
    const downloadFile = async () => {
      try {
        const response = await fetch(
          `/api/telegram/download?fileId=${encodeURIComponent(fileId)}&fileName=${encodeURIComponent(fileName)}`
        );

        if (!response.ok) {
          throw new Error('Download failed');
        }

        // Get the blob
        const blob = await response.blob();

        // Create download link and trigger
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setProgress(100);
        setMessage('✓ Tải xuống thành công!');
        setIsComplete(true);

        // Auto close after 2 seconds
        clearInterval(progressInterval);
        setTimeout(() => {
          window.close();
        }, 2000);
      } catch (error) {
        clearInterval(progressInterval);
        setMessage('✗ Lỗi khi tải xuống file');
        console.error('Download error:', error);
      }
    };

    downloadFile();

    return () => clearInterval(progressInterval);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">HUP Corner</h1>
          <p className="text-gray-600">Đang tải xuống tài liệu</p>
        </div>

        {/* Progress Content */}
        <div className="space-y-6">
          {/* File Name */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              {searchParams.get('fileName') || 'file.pdf'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            {/* Animated Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isComplete
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Progress Text */}
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-600">{message}</p>
              <span className="text-sm font-bold text-red-600">{progress}%</span>
            </div>
          </div>

          {/* Status Icons */}
          <div className="pt-4 text-center">
            {isComplete ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Trang này sẽ tự động đóng</p>
              </div>
            ) : (
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" />
                <div
                  className="w-2 h-2 rounded-full bg-red-500 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-red-500 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Vui lòng đợi cho đến khi tệp được tải xuống hoàn toàn
          </p>
        </div>
      </div>
    </div>
  );
}
