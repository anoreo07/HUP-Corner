'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, BookText, GraduationCap, ChevronRight, Search, Info } from 'lucide-react';
import { Subject } from '@/types/database';
import { Popover } from 'rizzui';


export default function SubjectsList({ initialSubjects }: { initialSubjects: Subject[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredSubjects = initialSubjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);

  const currentItems = filteredSubjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-black text-on-surface font-plus-jakarta tracking-tight">
              Môn học
            </h1>
            <Popover placement="right">
              <Popover.Trigger>
                <button className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors shadow-sm mt-1">
                  <Info size={18} />
                </button>
              </Popover.Trigger>
              <Popover.Content>
                <div className="p-4 max-w-[280px]">
                  <p className="text-xs font-bold text-on-surface leading-relaxed">
                    <span className="text-primary">Lưu ý:</span> Tài liệu Môn học sẽ được cập nhật liên tục bởi đội ngũ Admin để đảm bảo tính chính xác và mới nhất.
                  </p>
                </div>
              </Popover.Content>
            </Popover>
          </div>
          <p className="text-on-surface-variant text-sm font-medium max-w-2xl leading-relaxed">
            Tra cứu và khám phá kho tài liệu học tập khổng lồ được phân loại khoa học theo từng học phần chuyên biệt của HUP.
          </p>
        </div>

        {/* Search Bar Section */}
        <div className="relative group w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm môn học..."
            className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full shadow-[0px_10px_30px_rgba(13,52,89,0.03)] focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-sm tracking-tight placeholder:text-slate-400 placeholder:font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>


      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-6">
        {currentItems.map((subject) => (

          <Link key={subject.id} href={`/subjects/${subject.id}`}>
            <div className="group bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] border border-slate-100/50 dark:border-slate-800/50 shadow-[0px_10px_40px_rgba(13,52,89,0.04)] hover:shadow-[0px_20px_60px_rgba(13,52,89,0.08)] hover:border-primary/20 transition-all cursor-pointer flex flex-col h-full active:scale-[0.98]">
              <div className="flex-1">

                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 block opacity-70">
                  {subject.code}
                </span>
                <h3 className="text-xl font-black text-on-surface group-hover:text-primary transition-colors font-plus-jakarta mb-6 line-clamp-2 leading-tight">
                  {subject.name}
                </h3>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <BookText size={16} className="text-primary opacity-60" />
                    {subject.credits} Tín chỉ
                  </span>
                  <span className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-primary opacity-60" />
                    {subject.theory_hours + subject.practice_hours + subject.exercise_hours + subject.seminar_hours} Tiết
                  </span>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                <span className="text-[10px] font-black text-outline-variant uppercase tracking-[0.15em] opacity-60 group-hover:opacity-100 transition-opacity">
                  Xem chi tiết
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </Link>
        ))}

        {filteredSubjects.length === 0 && (
          <div className="col-span-full py-24 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Search size={40} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-on-surface font-plus-jakarta tracking-tight">Không tìm thấy môn học</h3>
            <p className="text-slate-400 mt-2 font-medium">Vui lòng thử tìm kiếm với từ khóa hoặc mã học phần khác.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-sm transition-all ${currentPage === page
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110'
                    : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-on-surface-variant hover:border-primary/40'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

