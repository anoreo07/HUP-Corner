'use client';

import React, { useState, useEffect, useRef } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { 
  Download, 
  Printer, 
  MoreVertical, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  Verified,
  FileText,
  Clock,
  ArrowLeft,
  Maximize2,
  Shrink,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentWithMajor } from '@/types/database';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import cn from '@core/utils/class-names';

interface DocumentPreviewClientProps {
  document: DocumentWithMajor;
  relatedDocuments: DocumentWithMajor[];
}

export default function DocumentPreviewClient({ document, relatedDocuments }: DocumentPreviewClientProps) {
  const [zoom, setZoom] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);

  // Lock body scroll when maximized
  useEffect(() => {
    if (isMaximized) {
      window.document.body.style.overflow = 'hidden';
    } else {
      window.document.body.style.overflow = 'unset';
    }
    return () => {
      window.document.body.style.overflow = 'unset';
    };
  }, [isMaximized]);

  const lastIncrementedId = useRef<string | null>(null);

  // Increment view count on mount
  useEffect(() => {
    if (lastIncrementedId.current === document.id) return;
    lastIncrementedId.current = document.id;

    const incrementView = async () => {
      try {
        await supabase.rpc('increment_view_count', { doc_id: document.id });
      } catch (err) {
        console.error('Failed to increment view count:', err);
      }
    };
    incrementView();
  }, [document.id]);



  const getPreviewUrl = () => {
    const fileNameLower = (document.file_name || '').toLowerCase();
    const isPdf = fileNameLower.endsWith('.pdf') || document.mime_type === 'application/pdf';
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileNameLower) || document.mime_type?.startsWith('image/');
    const isOffice = /\.(docx|doc|pptx|ppt|xlsx|xls)$/i.test(fileNameLower) || 
                     document.mime_type?.includes('officedocument') || 
                     document.mime_type?.includes('msword');
    
    let rawUrl = '';
    const targetMime = isPdf ? 'application/pdf' : (isImage ? (document.mime_type || 'image/jpeg') : 'application/octet-stream');

    if (document.storage_provider === 'telegram') {
      rawUrl = `/api/telegram/download?fileId=${encodeURIComponent(document.file_path)}&fileName=${encodeURIComponent(document.file_name || document.title)}&preview=true&mimeType=${encodeURIComponent(targetMime)}`;
    } else {
      const { data } = supabase.storage.from('documents').getPublicUrl(document.file_path);
      rawUrl = data.publicUrl;
    }

    if (isOffice) {
      // Note: Google Docs Viewer needs a PUBLIC absolute URL.
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        // Fallback for local development: return raw URL which might trigger download but at least it's clear why
        return rawUrl;
      }
      return `https://docs.google.com/gview?url=${encodeURIComponent(origin + rawUrl)}&embedded=true`;
    }

    return rawUrl;
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (document.storage_provider === 'telegram') {
        const response = await fetch(
          `/api/telegram/download?fileId=${encodeURIComponent(document.file_path)}&fileName=${encodeURIComponent(document.file_name || document.title)}`
        );
        if (!response.ok) throw new Error('Download failed');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.file_name || document.title;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const { data } = supabase.storage.from('documents').getPublicUrl(document.file_path);
        window.open(data.publicUrl, '_blank');
      }

      // Increment download count
      await supabase.rpc('increment_download_count', { doc_id: document.id });
      
      toast.success('Bắt đầu tải tài liệu...');

    } catch (err) {
      toast.error('Có lỗi khi tải file.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto sm:px-4 py-4 sm:py-8 mb-20">
      <div className="bg-white dark:bg-slate-900 sm:rounded-[2.5rem] border-x-0 sm:border border-slate-100 shadow-[0px_40px_100px_rgba(13,52,89,0.08)] overflow-hidden p-4 sm:p-8 md:p-12">

        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest mb-6 sm:mb-8 ml-2 sm:ml-0">
          <ArrowLeft size={16} />
          Quay lại trang chủ
        </Link>

        {/* Mobile Suggestion Notice */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:hidden mb-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-3"
        >
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Download size={18} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-on-surface mb-1">Tải xuống để xem tốt hơn</p>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Trình xem trực tuyến có thể hạn chế trên điện thoại. Bạn nên tải tài liệu hoặc sử dụng chế độ phóng to.
            </p>
          </div>
        </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Document View Area */}
        <div className="w-full lg:w-[65%] space-y-6 sm:space-y-8">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-[0px_20px_50px_rgba(13,52,89,0.1)] overflow-hidden group border border-slate-100/50 min-h-[500px] sm:min-h-[850px] flex items-center justify-center">
            {loadingPreview && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold text-primary animate-pulse">Đang tải bản xem trước...</p>
              </div>
            )}
            <div 
              className="transition-transform duration-300 ease-out origin-top flex justify-center w-full h-full bg-slate-50/50"
              style={{ transform: `scale(${zoom})` }}
            >
              <iframe
                src={getPreviewUrl()}
                className="w-full h-[500px] sm:h-[850px] border-none rounded-xl sm:rounded-2xl bg-white"
                title={document.title}
                onLoad={() => setLoadingPreview(false)}
              />
            </div>

            {/* Immersive Toolbar */}
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 sm:gap-6 px-5 py-3 bg-on-surface/95 backdrop-blur-md rounded-full text-white shadow-2xl transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
              <button onClick={handleZoomOut} title="Thu nhỏ" className="hover:text-primary-container transition-colors p-1"><ZoomOut size={18} /></button>
              <div className="h-4 w-px bg-white/20" />
              <button onClick={handleZoomIn} title="Phóng to" className="hover:text-primary-container transition-colors p-1"><ZoomIn size={18} /></button>
              <div className="h-4 w-px bg-white/20" />
              <button onClick={() => setIsMaximized(true)} title="Toàn màn hình" className="hover:text-primary-container transition-colors p-1">
                <Maximize2 size={18} />
              </button>
            </div>
          </div>

          {/* Full Screen Overlay */}
          <AnimatePresence>
            {isMaximized && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999] bg-slate-900/95 backdrop-blur-xl flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10 shrink-0">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                        <FileText size={16} />
                      </div>
                      <h3 className="text-white font-bold text-sm truncate max-w-[200px] sm:max-w-md">{document.title}</h3>
                   </div>
                   <button 
                    onClick={() => setIsMaximized(false)}
                    className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                   >
                      <X size={20} />
                   </button>
                </div>
                <div className="flex-1 overflow-auto bg-white/5 relative">
                   <iframe
                    src={getPreviewUrl()}
                    className="w-full h-full border-none bg-white shadow-2xl"
                    title={document.title}
                  />
                  {/* Floating Action for Mobile when Maximized */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-primary rounded-full shadow-2xl sm:hidden">
                      <button onClick={handleDownload} className="text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest px-2">
                        <Download size={18} />
                        Tải về
                      </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metadata Section */}
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 sm:mb-10">
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 sm:mb-3 block">Chi tiết học thuật</span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-on-surface font-plus-jakarta leading-tight">{document.title}</h2>
              </div>
              <div className="flex bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest border border-green-100 dark:border-green-500/20 items-center gap-2 shadow-sm shrink-0">
                <Verified size={14} className="fill-green-600 dark:fill-green-400 text-white dark:text-slate-900" />
                Verified
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
              <InfoItem label="Chuyên ngành" value={document.majors?.name || 'Khác'} />
              <InfoItem label="Môn học" value={document.subject_name || 'N/A'} />
              <InfoItem label="Năm học" value={document.academic_year ? `Năm học ${document.academic_year}` : 'N/A'} />

              <InfoItem label="Dung lượng" value={document.file_size ? `${(document.file_size / (1024 * 1024)).toFixed(1)} MB` : 'N/A'} />
            </div>

            {/* Action Buttons */}
            <div className="mt-12 pt-8 border-t border-slate-50">
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
              >
                <Download size={18} className={downloading ? 'animate-bounce' : ''} />
                {downloading ? 'Đang chuẩn bị...' : 'Tải xuống tài liệu ngay'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Related Documents */}
        <aside className="w-full lg:w-[35%] space-y-6 sm:space-y-8 mt-4 lg:mt-0">
          <div className="flex items-center justify-between px-2 sm:px-3">
            <h3 className="text-lg sm:text-xl font-black text-on-surface tracking-tight font-plus-jakarta">Tài liệu liên quan</h3>
            <button className="text-xs font-bold text-primary hover:underline">Khám phá thêm</button>
          </div>

          <div className="space-y-5">
            {relatedDocuments.map((doc) => (
              <Link key={doc.id} href={`/documents/${doc.id}`}>
                <motion.div 
                  whileHover={{ x: 8 }}
                  className="group flex gap-5 p-5 rounded-3xl bg-white border border-slate-100 hover:border-primary/20 transition-all cursor-pointer shadow-sm hover:shadow-xl"
                >
                  <div className="w-24 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center relative shadow-inner">
                    <FileText size={32} className="text-slate-200" />
                  </div>
                  <div className="flex flex-col justify-between py-2 flex-1">
                    <div>
                      <h4 className="text-sm font-black text-on-surface leading-snug group-hover:text-primary transition-colors font-plus-jakarta line-clamp-2">{doc.title}</h4>
                      <p className="text-[10px] text-outline font-bold mt-2 uppercase tracking-widest">{doc.majors?.name || 'Học thuật'}</p>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded-full uppercase tracking-widest">Premium</span>
                      <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-black rounded-full uppercase tracking-widest">
                        {doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
            
            {relatedDocuments.length === 0 && (
              <p className="text-sm text-outline italic px-4">Chưa có tài liệu liên quan nào.</p>
            )}
          </div>

        </aside>
      </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-outline-variant uppercase tracking-[0.15em]">{label}</p>
      <p className="text-base text-on-surface font-black tracking-tight">{value}</p>
    </div>
  );
}
