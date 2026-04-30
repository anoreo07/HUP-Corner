'use client';

import React, { useState } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
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
      toast.success('Bắt đầu tải tài liệu...');
    } catch (err) {
      toast.error('Có lỗi khi tải file.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 mb-20 scale-[0.8] origin-top w-[125%] h-[125%] -translate-x-[10%]">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <Link href="/">
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-all text-primary active:scale-90">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div>
            <h1 className="font-plus-jakarta text-xl font-bold tracking-tight text-on-surface line-clamp-1">{document.title}</h1>
            <p suppressHydrationWarning className="text-[10px] text-outline font-bold uppercase tracking-widest mt-0.5">
               Uploaded • {new Date(document.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors text-primary disabled:opacity-50"
          >
            <Download size={22} className={downloading ? 'animate-bounce' : ''} />
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors text-primary">
            <Printer size={22} />
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors text-primary">
            <MoreVertical size={22} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Document View Area */}
        <div className="w-full lg:w-3/5 space-y-8">
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-[0px_20px_50px_rgba(13,52,89,0.1)] overflow-hidden group border border-slate-100/50 min-h-[700px] flex items-center justify-center">
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
                className="w-full h-[700px] border-none rounded-2xl bg-white"
                title={document.title}
                onLoad={() => setLoadingPreview(false)}
              />
            </div>

            {/* Immersive Toolbar (Simplified) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-3 bg-on-surface/95 backdrop-blur-md rounded-full text-white shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100">
              <button onClick={handleZoomOut} className="hover:text-primary-container transition-colors"><ZoomOut size={18} /></button>
              <div className="h-4 w-px bg-white/20" />
              <button onClick={handleZoomIn} className="hover:text-primary-container transition-colors"><ZoomIn size={18} /></button>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3 block">Chi tiết học thuật</span>
                <h2 className="text-3xl font-black tracking-tight text-on-surface font-plus-jakarta leading-tight">{document.title}</h2>
              </div>
              <div className="flex bg-green-50 text-green-600 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border border-green-100 items-center gap-2 shadow-sm">
                <Verified size={16} className="fill-green-600 text-white" />
                Verified
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              <InfoItem label="Chuyên ngành" value={document.majors?.name || 'Khác'} />
              <InfoItem label="Môn học" value={document.subject_name || 'N/A'} />
              <InfoItem label="Năm học" value={document.academic_year || 'N/A'} />
              <InfoItem label="Dung lượng" value={document.file_size ? `${(document.file_size / (1024 * 1024)).toFixed(1)} MB` : 'N/A'} />
            </div>
          </div>
        </div>

        {/* Sidebar: Related Documents */}
        <aside className="w-full lg:w-2/5 space-y-8">
          <div className="flex items-center justify-between px-3">
            <h3 className="text-xl font-black text-on-surface tracking-tight font-plus-jakarta">Tài liệu liên quan</h3>
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

          {/* Premium Action Card */}
          <div className="bg-gradient-to-br from-[#3355c9] to-[#6e3bd8] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h4 className="text-2xl font-black mb-3 font-plus-jakarta">Nâng cấp HUP Corner+</h4>
              <p className="text-white/80 text-[13px] mb-8 leading-relaxed font-medium">Mở khóa quyền truy cập không giới hạn vào hơn 100,000 tài liệu chuyên ngành được tuyển chọn.</p>
              <button className="w-full py-5 bg-white text-[#3355c9] font-black rounded-full hover:shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 text-[11px] uppercase tracking-[0.2em]">
                Đăng ký ngay
              </button>
            </div>
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          </div>
        </aside>
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
