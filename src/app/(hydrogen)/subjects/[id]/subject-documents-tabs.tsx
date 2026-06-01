'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentWithMajor } from '@/types/database';
import { DocumentCard } from '@/app/shared/document-card';
import { FileText, BookOpen, Layers } from 'lucide-react';
import cn from '@core/utils/class-names';

interface SubjectDocumentsTabsProps {
  documents: DocumentWithMajor[];
}

export function SubjectDocumentsTabs({ documents }: SubjectDocumentsTabsProps) {
  const [activeTab, setActiveTab] = useState<'THEORY' | 'PRACTICAL'>('THEORY');

  // Filter documents: if category is null, default to THEORY to avoid hiding legacy files
  const theoryDocs = documents.filter((doc) => !doc.category || doc.category === 'THEORY');
  const practicalDocs = documents.filter((doc) => doc.category === 'PRACTICAL');

  const displayedDocs = activeTab === 'THEORY' ? theoryDocs : practicalDocs;

  return (
    <div className="space-y-8">
      {/* Dynamic Tabs Navigation */}
      <div className="flex justify-center p-1 bg-slate-50 dark:bg-slate-800/40 rounded-2xl max-w-sm mx-auto border border-slate-100 dark:border-slate-800 shadow-inner">
        <button
          onClick={() => setActiveTab('THEORY')}
          className={cn(
            "relative flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors rounded-xl flex items-center justify-center gap-2",
            activeTab === 'THEORY' ? "text-primary" : "text-slate-500 hover:text-slate-700"
          )}
        >
          {activeTab === 'THEORY' && (
            <motion.div
              layoutId="active-tab-bg"
              className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100/50"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <BookOpen size={14} />
            Lý thuyết ({theoryDocs.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PRACTICAL')}
          className={cn(
            "relative flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors rounded-xl flex items-center justify-center gap-2",
            activeTab === 'PRACTICAL' ? "text-primary" : "text-slate-500 hover:text-slate-700"
          )}
        >
          {activeTab === 'PRACTICAL' && (
            <motion.div
              layoutId="active-tab-bg"
              className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100/50"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Layers size={14} />
            Thực tập ({practicalDocs.length})
          </span>
        </button>
      </div>

      {/* Animated Documents Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]"
      >
        <AnimatePresence mode="popLayout">
          {displayedDocs.map((doc) => (
            <motion.div
              key={doc.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DocumentCard doc={doc} />
            </motion.div>
          ))}
        </AnimatePresence>

        {displayedDocs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800"
          >
            <FileText size={48} className="text-slate-300 dark:text-slate-700 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-slate-500">Chưa có tài liệu</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto font-medium px-4">
              Mục này hiện chưa có tài liệu nào được đăng tải và kiểm duyệt.
            </p>
          </motion.div>
        )}
      </motion.div>

    </div>
  );
}
