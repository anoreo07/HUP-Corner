'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Bookmark, 
  ArrowRight,
  BookOpen,
  Clock,
  FlaskConical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DocumentWithMajor, DocumentType } from '@/types/database';
import cn from '@core/utils/class-names';

export const documentTypeLabels: Record<DocumentType, string> = {
  EXAM: 'Đề thi',
  SLIDE: 'Slide bài giảng',
  TEXTBOOK: 'Giáo trình',
  OTHER: 'Khác',
};

export const getDocumentTypeStyles = (type: DocumentType) => {
  switch (type) {
    case 'EXAM': return 'bg-error-container text-on-error-container border-error/10';
    case 'SLIDE': return 'bg-secondary-container text-on-secondary-container border-secondary/10';
    case 'TEXTBOOK': return 'bg-tertiary-container text-on-tertiary-container border-tertiary/10';
    default: return 'bg-surface-container-high text-on-surface-variant border-outline/10';
  }
};

export function InfoRow({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-4 text-on-surface-variant group-hover:text-on-surface transition-colors">
      <div className="text-primary opacity-70">{icon}</div>
      <span className="text-sm font-bold tracking-tight line-clamp-1">{text}</span>
    </div>
  );
}

export function DocumentCard({ doc }: { doc: DocumentWithMajor }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className="group bg-white dark:bg-slate-900 rounded-[2rem] p-7 shadow-[0px_10px_40px_rgba(13,52,89,0.04)] border border-slate-100/50 hover:shadow-[0px_20px_60px_rgba(13,52,89,0.08)] transition-all flex flex-col justify-between min-h-[340px]"
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <span className={cn(
            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] font-label border",
            getDocumentTypeStyles(doc.document_type)
          )}>
            {documentTypeLabels[doc.document_type]}
          </span>
          <button className="text-outline-variant hover:text-primary transition-all active:scale-90">
            <Bookmark size={18} />
          </button>
        </div>
        
        <Link href={`/documents/${doc.id}`}>
          <h2 className="text-xl font-black text-on-surface leading-snug mb-6 group-hover:text-primary transition-colors font-plus-jakarta line-clamp-2">
            {doc.title}
          </h2>
        </Link>

        <div className="space-y-3.5">
          <InfoRow icon={<BookOpen size={16} />} text={doc.majors?.name || 'Học thuật'} />
          <InfoRow icon={<FlaskConical size={16} />} text={doc.subject_name || 'Đang cập nhật'} />
          <InfoRow icon={<Clock size={16} />} text={doc.academic_year || 'Năm học'} />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t-[5px] border-slate-50 flex justify-between items-center">
        <span className="text-[9px] font-black text-outline-variant uppercase tracking-widest opacity-60">
          {doc.mime_type?.includes('pdf') ? 'PDF' : 'DOCX'} • {((doc.file_size || 0) / (1024 * 1024)).toFixed(1)} MB
        </span>
        <Link href={`/documents/${doc.id}`}>
          <button className="bg-slate-50 text-primary px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2 group/btn shadow-sm active:scale-95">
            Chi tiết
            <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
