'use client';

import { useState, useMemo } from 'react';
import { Modal, ActionIcon, Button } from 'rizzui';
import {
  PiXBold,
  PiDownloadSimpleBold,
  PiFilePdf,
  PiFileDoc,
  PiPresentation,
  PiFolderOpen,
  PiImage,
  PiFileTextDuotone,
  PiEyeBold,
  PiArrowsOutBold,
} from 'react-icons/pi';
import { DocumentWithMajor, DocumentType } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

const documentTypeLabels: Record<DocumentType, string> = {
  EXAM: 'Đề thi',
  SLIDE: 'Slide bài giảng',
  TEXTBOOK: 'Giáo trình',
  OTHER: 'Khác',
};

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return <PiFileTextDuotone className="h-6 w-6 text-gray-500" />;
  
  if (mimeType.includes('pdf')) return <PiFilePdf className="h-6 w-6 text-red-500" />;
  if (mimeType.includes('presentation') || mimeType.includes('pptx'))
    return <PiPresentation className="h-6 w-6 text-orange-500" />;
  if (mimeType.includes('word') || mimeType.includes('document'))
    return <PiFileDoc className="h-6 w-6 text-blue-500" />;
  if (mimeType.includes('image'))
    return <PiImage className="h-6 w-6 text-green-500" />;
  
  return <PiFileTextDuotone className="h-6 w-6 text-gray-500" />;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

type PreviewType = 'pdf' | 'image' | 'word' | 'pptx' | 'none';

function getPreviewType(mimeType: string | null): PreviewType {
  if (!mimeType) return 'none';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
  if (
    mimeType.includes('presentation') ||
    mimeType.includes('pptx') ||
    mimeType.includes('powerpoint')
  )
    return 'pptx';
  return 'none';
}

function getPreviewUrl(document: DocumentWithMajor, type: PreviewType): string {
  if (document.storage_provider === 'telegram') {
    // Word uses dedicated mammoth conversion endpoint
    if (type === 'word') {
      return `/api/telegram/preview-word?fileId=${encodeURIComponent(document.file_path)}`;
    }
    return `/api/telegram/preview?fileId=${encodeURIComponent(document.file_path)}&mimeType=${encodeURIComponent(document.mime_type || 'application/octet-stream')}`;
  }
  const { data } = supabase.storage.from('documents').getPublicUrl(document.file_path);
  return data.publicUrl;
}

interface DocumentDetailModalProps {
  document: DocumentWithMajor | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentDetailModal({
  document,
  isOpen,
  onClose,
}: DocumentDetailModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const previewType = useMemo(
    () => (document ? getPreviewType(document.mime_type) : 'none'),
    [document]
  );

  // Build absolute URL for external viewers (Google Docs Viewer needs public URLs)
  const previewUrl = useMemo(() => {
    if (!document) return '';
    const relativeUrl = getPreviewUrl(document, previewType);
    if (relativeUrl.startsWith('http')) return relativeUrl;
    // PPTX needs absolute URL for Google Docs Viewer
    if (previewType === 'pptx') {
      return `${window.location.origin}${relativeUrl}`;
    }
    return relativeUrl;
  }, [document, previewType]);

  if (!document) return null;

  const canPreview = previewType !== 'none';

  const handleDownload = async () => {
    if (document.storage_provider === 'telegram') {
      // Download from Telegram via our API
      setDownloading(true);
      try {
        const response = await fetch(
          `/api/telegram/download?fileId=${encodeURIComponent(document.file_path)}&fileName=${encodeURIComponent(document.file_name || document.title)}`
        );

        if (!response.ok) {
          throw new Error('Download failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.file_name || document.title;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success('Tải file thành công!');
      } catch (err) {
        console.error('Download error:', err);
        toast.error('Có lỗi khi tải file. Vui lòng thử lại.');
      } finally {
        setDownloading(false);
      }
    } else {
      // Fallback: download from Supabase Storage
      const { data } = supabase.storage.from('documents').getPublicUrl(document.file_path);
      window.open(data.publicUrl, '_blank');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setShowPreview(false);
        onClose();
      }}
      size={showPreview ? 'full' : 'xl'}
      overlayClassName="dark:bg-opacity-40 dark:bg-gray-50 dark:backdrop-blur-sm"
      containerClassName="!items-start !pt-10"
      className="z-[9999] !p-0 overflow-hidden"
    >
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900">
              {document.title}
            </h2>
            <ActionIcon
              variant="text"
              size="sm"
              className="text-gray-500 hover:text-gray-700 shrink-0"
              onClick={() => {
                setShowPreview(false);
                onClose();
              }}
            >
              <PiXBold className="h-5 w-5" />
            </ActionIcon>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="relative bg-gray-100 border-b border-gray-200">
            {previewLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
                  <span className="text-sm text-gray-500">Đang tải xem trước...</span>
                </div>
              </div>
            )}

            {previewType === 'pdf' && (
              <iframe
                src={previewUrl}
                className="w-full border-0"
                style={{ height: '70vh' }}
                title="PDF Preview"
                onLoad={() => setPreviewLoading(false)}
              />
            )}

            {previewType === 'image' && (
              <div className="flex items-center justify-center p-4" style={{ maxHeight: '70vh' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={document.title}
                  className="max-h-[65vh] max-w-full rounded-lg object-contain shadow-lg"
                  onLoad={() => setPreviewLoading(false)}
                  onError={() => {
                    setPreviewLoading(false);
                    toast.error('Không thể tải ảnh xem trước');
                  }}
                />
              </div>
            )}

            {previewType === 'word' && (
              <iframe
                src={previewUrl}
                className="w-full border-0 bg-white"
                style={{ height: '70vh' }}
                title="Word Preview"
                onLoad={() => setPreviewLoading(false)}
              />
            )}

            {previewType === 'pptx' && (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`}
                className="w-full border-0"
                style={{ height: '70vh' }}
                title="PPTX Preview"
                onLoad={() => setPreviewLoading(false)}
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          {/* Info Section */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">{document.majors?.name || 'Chưa phân loại'}</span>
              {document.subject_name && (
                <>
                  <span>-</span>
                  <span>{document.subject_name}</span>
                </>
              )}
            </div>
            <p className="text-gray-500">
              {document.title} - {document.majors?.name || 'HUP'}
            </p>
            {document.academic_year && (
              <p className="text-sm text-gray-400">
                Năm học: {document.academic_year}
              </p>
            )}
          </div>

          {/* Files Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <PiFolderOpen className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-700">
                {documentTypeLabels[document.document_type]} (1)
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {getFileIcon(document.mime_type)}
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {document.file_name || document.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(document.file_size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canPreview && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1.5 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => {
                        setPreviewLoading(true);
                        setShowPreview(!showPreview);
                        if (showPreview) setPreviewLoading(false);
                      }}
                    >
                      {showPreview ? (
                        <>
                          <PiArrowsOutBold className="h-4 w-4" />
                          ẨN
                        </>
                      ) : (
                        <>
                          <PiEyeBold className="h-4 w-4" />
                          XEM TRƯỚC
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                    onClick={handleDownload}
                    isLoading={downloading}
                    disabled={downloading}
                  >
                    <PiDownloadSimpleBold className="h-4 w-4" />
                    {downloading ? 'ĐANG TẢI...' : 'DOWNLOAD'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-3 text-center text-sm text-gray-500 border-t border-gray-200">
          Ngày tải lên: {new Date(document.created_at).toLocaleDateString('vi-VN')}
        </div>
      </div>
    </Modal>
  );
}
