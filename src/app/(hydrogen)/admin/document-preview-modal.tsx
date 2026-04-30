'use client';

import { useState } from 'react';
import { Modal, Button, Loader } from 'rizzui';
import { PiDownloadSimpleBold, PiXBold } from 'react-icons/pi';
import Image from 'next/image';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  documentName: string;
  documentUrl: string;
  mimeType?: string | null;
  onClose: () => void;
}

export function DocumentPreviewModal({
  isOpen,
  documentName,
  documentUrl,
  mimeType,
  onClose,
}: DocumentPreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPDF = mimeType?.includes('pdf');
  const isPowerPoint = mimeType?.includes('presentation') || mimeType?.includes('pptx') || mimeType?.includes('ppt');
  const isImage = mimeType?.includes('image');
  const isText = mimeType?.includes('text') || mimeType?.includes('plain') || mimeType?.includes('markdown');

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    setLoading(false);
    setError('Không thể hiển thị tệp này. Vui lòng tải xuống để xem.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-6xl">
      <div className="w-full bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white truncate">{documentName}</h2>
            <p className="text-sm text-blue-100 mt-1">📄 {mimeType || 'Tệp'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition"
          >
            <PiXBold className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="bg-gray-100 relative" style={{ height: '600px', overflow: 'auto' }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
              <Loader variant="spinner" size="lg" />
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-6">
              <div className="text-center">
                <p className="text-gray-700 text-lg font-semibold mb-4">⚠️ {error}</p>
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  <PiDownloadSimpleBold className="h-5 w-5" />
                  Tải xuống tệp
                </a>
              </div>
            </div>
          )}

          {!error && (
            <>
              {isPDF && (
                <iframe
                  src={`${documentUrl}#toolbar=1`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  onLoad={handleLoad}
                  onError={handleError}
                />
              )}

              {isPowerPoint && (
                <div className="flex flex-col items-center justify-center h-full bg-gray-200 p-6">
                  <div className="text-center">
                    <p className="text-gray-700 text-lg font-semibold mb-4">
                      📊 PowerPoint không thể xem trước trực tiếp trên trình duyệt
                    </p>
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition"
                    >
                      <PiDownloadSimpleBold className="h-5 w-5" />
                      Tải xuống & Mở
                    </a>
                  </div>
                </div>
              )}

              {isImage && (
                <div className="flex items-center justify-center h-full p-4 bg-gray-100 relative">
                  <Image
                    src={documentUrl}
                    alt={documentName}
                    fill
                    className="object-contain"
                    onLoad={handleLoad}
                    onError={handleError}
                    unoptimized
                  />
                </div>
              )}

              {isText && (
                <iframe
                  src={documentUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  onLoad={handleLoad}
                  onError={handleError}
                />
              )}

              {!isPDF && !isPowerPoint && !isImage && !isText && (
                <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-6">
                  <div className="text-center">
                    <p className="text-gray-700 text-lg font-semibold mb-4">
                      📎 Không hỗ trợ xem trước loại tệp này
                    </p>
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                      <PiDownloadSimpleBold className="h-5 w-5" />
                      Tải xuống tệp
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Đóng
          </Button>
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
          >
            <PiDownloadSimpleBold className="h-5 w-5" />
            Tải xuống
          </a>
        </div>
      </div>
    </Modal>
  );
}
