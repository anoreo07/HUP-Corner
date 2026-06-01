'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSubjects, getDocumentsBySubject } from '@/lib/supabase';
import { Subject, DocumentWithMajor } from '@/types/database';
import { DocumentCard } from '@/app/shared/document-card';
import {
  BookOpen,
  Layers,
  Sparkles,
  HelpCircle,
  FileText,
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  Search
} from 'lucide-react';
import cn from '@core/utils/class-names';
import { Loader, Input } from 'rizzui';

type TabType = 'quiz' | 'flashcards' | 'outlines';

export default function ExamPrepPage() {
  const [activeTab, setActiveTab] = useState<TabType>('outlines');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [outlines, setOutlines] = useState<DocumentWithMajor[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingOutlines, setLoadingOutlines] = useState(false);

  // Fetch subjects on mount
  useEffect(() => {
    getSubjects()
      .then((data) => {
        setSubjects(data || []);
      })
      .catch(console.error)
      .finally(() => setLoadingSubjects(false));
  }, []);

  // Fetch outlines when selectedSubject changes
  useEffect(() => {
    if (!selectedSubject) {
      setOutlines([]);
      return;
    }

    setLoadingOutlines(true);
    getDocumentsBySubject(selectedSubject.id)
      .then((docs) => {
        // Filter only OUTLINE document types
        const outlineDocs = docs.filter(doc => doc.document_type === 'OUTLINE');
        setOutlines(outlineDocs);
      })
      .catch(console.error)
      .finally(() => setLoadingOutlines(false));
  }, [selectedSubject]);

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary rounded-[3rem] p-8 sm:p-12 md:p-16 text-white mb-12 shadow-2xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-md border border-white/10">
            <Sparkles size={14} className="text-amber-400" />
            HUP Exam Prep System
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-plus-jakarta tracking-tight leading-none mb-6">
            Bứt phá điểm số <br />mùa thi cử!
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
            Hệ thống tổng hợp đề cương, flashcard ghi nhớ nhanh và ngân hàng câu hỏi trắc nghiệm chất lượng giúp HUPers ôn tập hiệu quả nhất.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex justify-center p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl max-w-lg mx-auto border border-slate-100 dark:border-slate-800 shadow-inner mb-12">
        {(['quiz', 'flashcards', 'outlines'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "relative flex-1 py-3.5 text-xs font-black uppercase tracking-widest transition-colors rounded-2xl flex items-center justify-center gap-2",
              activeTab === tab ? "text-primary" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="exam-prep-tab-bg"
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100/50"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab === 'quiz' && <HelpCircle size={16} />}
              {tab === 'flashcards' && <Sparkles size={16} />}
              {tab === 'outlines' && <BookOpen size={16} />}
              {tab === 'quiz' ? 'Trắc nghiệm' : tab === 'flashcards' ? 'Flashcard' : 'Đề cương'}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'quiz' && (
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-12 sm:p-16 rounded-[3rem] shadow-xl text-center border border-slate-100/80 dark:border-slate-800 relative overflow-hidden">
              <div className="w-24 h-24 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/10 shadow-inner">
                <HelpCircle size={44} />
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded-full uppercase tracking-widest border border-amber-200 shadow-sm shrink-0 mb-4 inline-block">
                Coming Soon
              </span>
              <h2 className="text-3xl font-black text-on-surface mb-4">Luyện trắc nghiệm thông minh</h2>
              <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                Hệ thống ngân hàng câu hỏi trắc nghiệm tự luyện theo từng môn học giúp củng cố kiến thức vững chắc trước ngày thi. Đang được phát triển tích cực.
              </p>
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-12 sm:p-16 rounded-[3rem] shadow-xl text-center border border-slate-100/80 dark:border-slate-800 relative overflow-hidden">
              <div className="w-24 h-24 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/10 shadow-inner">
                <Sparkles size={44} />
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded-full uppercase tracking-widest border border-amber-200 shadow-sm shrink-0 mb-4 inline-block">
                Coming Soon
              </span>
              <h2 className="text-3xl font-black text-on-surface mb-4">Ghi nhớ nhanh bằng Flashcard</h2>
              <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                Ôn tập thần tốc các định nghĩa, công thức dược lý, giải phẫu bằng thẻ ghi nhớ thông minh. Tối ưu thời gian ôn thi của bạn. Đang được chuẩn bị ra mắt.
              </p>
            </div>
          )}

          {activeTab === 'outlines' && (
            <div className="space-y-8">
              {!selectedSubject ? (
                <div>
                  <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-on-surface tracking-tight font-plus-jakarta">
                        Đề cương ôn thi theo môn học
                      </h2>
                      <p className="text-slate-500 text-sm font-medium mt-1">
                        Chọn một môn học bên dưới để xem các đề cương chất lượng do sinh viên đóng góp.
                      </p>
                    </div>
                    <div className="w-full md:w-80 shrink-0">
                      <Input
                        type="text"
                        placeholder="Tìm kiếm môn học..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        prefix={<Search size={16} className="text-slate-400" />}
                        className="rounded-xl [&>div]:bg-white dark:[&>div]:bg-slate-900"
                        clearable
                        onClear={() => setSearchQuery('')}
                      />
                    </div>
                  </div>

                  {loadingSubjects ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                      <Loader size="lg" className="mb-4" />
                      <p className="text-slate-400 font-medium">Đang tải danh sách môn học...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSubjects.map((subject) => (
                        <motion.div
                          key={subject.id}
                          whileHover={{ y: -4 }}
                          onClick={() => setSelectedSubject(subject)}
                          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-7 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center shrink-0 border border-primary/5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                              <GraduationCap size={22} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-black text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors duration-300 truncate leading-snug">
                                {subject.name}
                              </h4>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                Mã: {subject.code} • {subject.credits} tín chỉ
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0" />
                        </motion.div>
                      ))}

                      {filteredSubjects.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/30 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                          <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                          <h3 className="text-xl font-bold text-slate-500">
                            {subjects.length === 0 ? 'Chưa có môn học nào' : 'Không tìm thấy môn học'}
                          </h3>
                          <p className="text-sm text-slate-400 mt-1">
                            {subjects.length === 0 ? 'Hệ thống hiện chưa cập nhật dữ liệu môn học.' : 'Vui lòng thử từ khóa tìm kiếm khác.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Subject outlines page header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedSubject(null)}
                        className="w-12 h-12 rounded-full border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors shadow-sm shrink-0"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <div>
                        <h2 className="text-2xl font-black text-on-surface tracking-tight font-plus-jakarta">
                          Đề cương môn: {selectedSubject.name}
                        </h2>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">
                          Mã học phần: {selectedSubject.code}
                        </p>
                      </div>
                    </div>
                    <span className="px-5 py-2.5 bg-primary/10 text-primary text-xs font-black rounded-full uppercase tracking-widest shrink-0 shadow-sm">
                      {outlines.length} đề cương đề xuất
                    </span>
                  </div>

                  {loadingOutlines ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                      <Loader size="lg" className="mb-4" />
                      <p className="text-slate-400 font-medium">Đang tìm kiếm đề cương môn học...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
                      {outlines.map((doc) => (
                        <DocumentCard key={doc.id} doc={doc} />
                      ))}

                      {outlines.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                          <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4 animate-pulse" />
                          <h3 className="text-xl font-bold text-slate-500">Chưa có đề cương</h3>
                          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto font-medium">
                            Môn học này hiện chưa có đề cương ôn thi nào được tải lên.
                          </p>
                          <button
                            onClick={() => setSelectedSubject(null)}
                            className="mt-6 px-6 py-2.5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
                          >
                            Quay lại chọn môn khác
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
