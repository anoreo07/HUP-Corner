'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  ArrowRight,
  FileText,
  Clock,
  BookOpen,
  FlaskConical,
  Stethoscope,
  Sprout,
  Dna,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentWithMajor, DocumentType } from '@/types/database';
import { getApprovedDocumentsPaginated, getOtherDocumentsPaginated } from '@/lib/supabase';
import cn from '@core/utils/class-names';
import Image from 'next/image';
import Link from 'next/link';
import { DocumentCard } from './document-card';

const majorFilters = [
  { name: 'Tất cả', code: 'ALL', icon: <BookOpen size={18} /> },
  { name: 'Dược học', code: 'DUOC_HOC', icon: <Stethoscope size={18} /> },
  { name: 'Hóa dược', code: 'HOA_DUOC', icon: <FlaskConical size={18} /> },
  { name: 'Công nghệ sinh học', code: 'CONG_NGHE_SINH_HOC', icon: <Dna size={18} /> },
  { name: 'Hóa học', code: 'HOA_HOC', icon: <FlaskConical size={18} /> },
  { name: 'Tài liệu khác', code: 'OTHER', icon: <MoreHorizontal size={18} /> },
];


export default function DocumentExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMajor = searchParams.get('major') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  const [activeMajor, setActiveMajor] = useState(initialMajor);
  const [searchText, setSearchText] = useState(initialSearch);
  const [documents, setDocuments] = useState<DocumentWithMajor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 9;

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      if (activeMajor === 'OTHER') {
        result = await getOtherDocumentsPaginated(page, perPage);
      } else {
        const majorCode = activeMajor === 'ALL' ? undefined : activeMajor;
        result = await getApprovedDocumentsPaginated(majorCode, page, perPage);
      }
      
      // Filter by search text if provided
      let filteredData = result.data;
      if (searchText) {
        filteredData = filteredData.filter(doc => 
          doc.title.toLowerCase().includes(searchText.toLowerCase()) ||
          doc.subject_name?.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      
      setDocuments(filteredData);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [activeMajor, page, searchText]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    const major = searchParams.get('major') || 'ALL';
    setActiveMajor(major);
  }, [searchParams]);

  const handleMajorChange = (code: string) => {
    setActiveMajor(code);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (code === 'ALL') params.delete('major');
    else params.set('major', code);
    router.push(`/all-majors?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-on-surface mb-2 tracking-tight font-plus-jakarta leading-tight">
              {majorFilters.find(m => m.code === activeMajor)?.name || 'Tất cả tài liệu'}
            </h1>
            <p className="text-on-surface-variant font-medium text-sm opacity-70">
              Khám phá kho tri thức được lưu trữ và sắp xếp bởi cộng đồng.
            </p>
          </div>
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input 
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm kiếm tài liệu, môn học..."
              className="w-full pl-12 pr-5 py-3.5 bg-surface-container-low border-none rounded-xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all placeholder:text-outline text-sm font-medium shadow-sm"
            />
          </div>
        </div>

        {/* Subject Filters */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
          {majorFilters.map((major) => (
            <button
              key={major.code}
              onClick={() => handleMajorChange(major.code)}
              className={cn(
                "whitespace-nowrap flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs transition-all duration-300 shadow-sm active:scale-95",
                activeMajor === major.code
                  ? "bg-primary text-on-primary shadow-primary/20 shadow-lg -translate-y-0.5"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              )}
            >
              {major.icon}
              {major.name}
            </button>
          ))}
        </div>
      </section>

      {/* Document Grid */}
      <section className="relative min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-50">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl p-8 h-80 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : documents.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {documents.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </AnimatePresence>
            
            {/* Upload Suggestion Card */}
            <Link href="#" className="group">
              <div className="h-full border-2 border-dashed border-outline-variant/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-6 hover:border-primary/50 transition-all cursor-pointer bg-slate-50/50">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                  <FileText size={32} className="opacity-40 group-hover:opacity-100" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-lg">Bạn có tài liệu mới?</h3>
                  <p className="text-sm text-on-surface-variant mt-2 px-4 leading-relaxed">Đóng góp tài liệu để làm phong phú thêm kho tri thức HUP Corner.</p>
                </div>
                <div className="text-primary font-black text-xs uppercase tracking-[0.2em] group-hover:underline transition-all">Tải lên ngay</div>
              </div>
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Search size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-on-surface">Không tìm thấy tài liệu</h3>
            <p className="text-on-surface-variant mt-2 max-w-xs">Thử thay đổi từ khóa tìm kiếm hoặc chọn chuyên ngành khác.</p>
            <button 
              onClick={() => {setSearchText(''); setActiveMajor('ALL');}}
              className="mt-8 text-primary font-bold hover:underline"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-20 flex justify-center items-center gap-3">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="w-14 h-14 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-all disabled:opacity-30 active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={cn(
                "w-14 h-14 rounded-full font-black transition-all duration-300 active:scale-90 text-sm",
                page === i + 1
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              {i + 1}
            </button>
          ))}

          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="w-14 h-14 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-all disabled:opacity-30 active:scale-90"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

