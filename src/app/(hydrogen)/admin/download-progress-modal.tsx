'use client';

import { useEffect, useState } from 'react';
import { Modal, Button } from 'rizzui';

interface DownloadProgressModalProps {
  isOpen: boolean;
  fileId: string;
  fileName: string;
  onClose: () => void;
}

export function DownloadProgressModal({
  isOpen,
  fileId,
  fileName,
  onClose,
}: DownloadProgressModalProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Đang chuẩn bị tệp...');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !fileId) return;

    setProgress(0);
    setMessage('Đang chuẩn bị tệp...');
    setIsComplete(false);
    setError(null);

    // Simulate download progress
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(95, (elapsed / 12000) * 100);

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
          throw new Error('Tải file thất bại');
        }

        const blob = await response.blob();
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

        clearInterval(progressInterval);
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (err) {
        clearInterval(progressInterval);
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        setMessage('✗ Lỗi khi tải xuống');
      }
    };

    downloadFile();

    return () => clearInterval(progressInterval);
  }, [isOpen, fileId, fileName, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className="z-[9999]"
    >
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">Tải xuống tài liệu</h2>
          <p className="text-sm text-gray-500 mt-1 truncate">{fileName}</p>
        </div>

        {/* Progress Bar */}
        {!error && (
          <div className="space-y-3">
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

            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-600">{message}</p>
              <span className="text-sm font-bold text-red-600">{progress}%</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Animated Dots */}
        {!isComplete && !error && (
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

        {/* Success Icon */}
        {isComplete && !error && (
          <div className="flex justify-center">
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
          </div>
        )}

        {/* Close Button */}
        {(isComplete || error) && (
          <Button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Đóng
          </Button>
        )}
      </div>
    </Modal>
  );
}
