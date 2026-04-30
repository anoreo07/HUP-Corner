'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bookmark, 
  ArrowRight,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentWithMajor, DocumentType } from '@/types/database';
import cn from '@core/utils/class-names';
import Link from 'next/link';
import { DocumentCard } from './document-card';


interface DocumentListClientProps {
  documents: DocumentWithMajor[];
  showMajor?: boolean;
  serverPaginated?: boolean;
}

export default function DocumentListClient({
  documents,
  showMajor = false,
  serverPaginated = false,
}: DocumentListClientProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const perPage = 12;

  const totalPages = Math.max(1, Math.ceil(documents.length / perPage));
  const paginated = serverPaginated ? documents : documents.slice((page - 1) * perPage, page * perPage);

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
        <BookOpen size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">Chưa có tài liệu nào trong mục này.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {paginated.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </AnimatePresence>
      </div>

      {!serverPaginated && totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={cn(
                "w-10 h-10 rounded-full text-xs font-black transition-all",
                page === i + 1 ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </>
  );
}
