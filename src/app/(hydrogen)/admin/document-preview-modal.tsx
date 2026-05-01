'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Loader, ActionIcon, Title } from 'rizzui';
import { PiDownloadSimpleBold, PiXBold, PiFileTextFill } from 'react-icons/pi';
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
    setError('Không thể hiển thị tệp này trực tiếp. Vui lòng tải xuống để xem chi tiết.');
  };

  useEffect(() => {
    // Automatically finish loading for PPT and Unsupported types since they show a fallback UI
    const isUnsupported = !isPDF && !isPowerPoint && !isImage && !isText;
    if (isOpen && (isPowerPoint || isUnsupported) && loading) {
      handleLoad();
    }
  }, [isOpen, isPowerPoint, isPDF, isImage, isText, loading]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      customSize="1100px"
      overlayClassName="backdrop-blur-md"
      containerClassName="p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl"
    >
      <div className="w-full bg-white flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
              <PiFileTextFill size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-900 truncate tracking-tight font-plus-jakarta">{documentName}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Xem trước tệp</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{mimeType || 'Chưa rõ định dạng'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="hidden sm:flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-slate-200"
            >
              <PiDownloadSimpleBold size={16} />
              Tải xuống
            </a>
            <ActionIcon
              variant="text"
              onClick={onClose}
              className="rounded-full hover:bg-slate-100"
            >
              <PiXBold size={20} className="text-slate-400" />
            </ActionIcon>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-50 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm">
              <Loader size="lg" />
              <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Đang nạp nội dung...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
               <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                  <PiFileTextFill size={32} />
               </div>
               <p className="text-sm font-bold text-slate-600 max-w-xs mx-auto mb-6">{error}</p>
               <Button
                  onClick={() => window.open(documentUrl, '_blank')}
                  className="rounded-2xl bg-rose-500 hover:bg-rose-600 text-white px-8"
               >
                  Tải về máy
               </Button>
            </div>
          )}

          {!error && (
            <div className="w-full h-full">
              {isPDF && (
                <iframe
                  src={`${documentUrl}#toolbar=1`}
                  className="w-full h-full border-none"
                  onLoad={handleLoad}
                  onError={handleError}
                />
              )}

              {isPowerPoint && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-100">
                  <div className="w-20 h-20 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center mb-6 shadow-sm">
                    <PiFileTextFill size={40} />
                  </div>
                  <Title as="h3" className="text-xl font-black text-slate-900 mb-2 font-plus-jakarta">Xem trước PowerPoint</Title>
                  <p className="text-sm text-slate-500 mb-8 max-w-sm font-medium">Trình duyệt không hỗ trợ xem trực tiếp PowerPoint. Vui lòng tải xuống để có trải nghiệm tốt nhất.</p>
                  <Button
                    onClick={() => window.open(documentUrl, '_blank')}
                    className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white px-10 shadow-lg shadow-orange-100"
                  >
                    Tải xuống & Mở ngay
                  </Button>
                  {/* PPT shows a download UI, so we trigger load finish via effect */}
                </div>
              )}

              {isImage && (
                <div className="w-full h-full p-10 flex items-center justify-center">
                  <div className="relative w-full h-full max-w-4xl max-h-full rounded-2xl overflow-hidden shadow-2xl">
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
                </div>
              )}

              {isText && (
                <iframe
                  src={documentUrl}
                  className="w-full h-full border-none bg-white"
                  onLoad={handleLoad}
                  onError={handleError}
                />
              )}

              {!isPDF && !isPowerPoint && !isImage && !isText && (
                 <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mb-4">
                       <PiFileTextFill size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-600 mb-6">Định dạng tệp này hiện chưa hỗ trợ xem trước</p>
                    <Button
                       onClick={() => window.open(documentUrl, '_blank')}
                       className="rounded-2xl bg-slate-900 text-white px-8"
                    >
                       Tải xuống tệp
                    </Button>
                    {/* Unsupported types show a download UI, load finish via effect */}
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

