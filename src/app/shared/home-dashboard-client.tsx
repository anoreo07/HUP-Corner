'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DocumentWithMajor, Major } from '@/types/database';
import cn from '@core/utils/class-names';

interface HomeDashboardClientProps {
  featuredDocuments: DocumentWithMajor[];
  recentDocuments: DocumentWithMajor[];
  majors: Major[];
}

export default function HomeDashboardClient({
  featuredDocuments,
  recentDocuments,
  majors,
}: HomeDashboardClientProps) {
  const router = useRouter();

  const handleViewDetail = (doc: DocumentWithMajor) => {
    router.push(`/documents/${doc.id}`);
  };

  const MAJOR_STYLES: Record<string, { bg: string; border: string; text: string; hoverBg: string }> = {
    DUOC_HOC: {
      bg: 'bg-primary/5',
      border: 'border-primary/10',
      text: 'text-primary',
      hoverBg: 'hover:bg-primary/10',
    },
    HOA_DUOC: {
      bg: 'bg-secondary/5',
      border: 'border-secondary/10',
      text: 'text-secondary',
      hoverBg: 'hover:bg-secondary/10',
    },
    CONG_NGHE_SINH_HOC: {
      bg: 'bg-tertiary/5',
      border: 'border-tertiary/10',
      text: 'text-tertiary',
      hoverBg: 'hover:bg-tertiary/10',
    },
    HOA_HOC: {
      bg: 'bg-error/5',
      border: 'border-error/10',
      text: 'text-error',
      hoverBg: 'hover:bg-error/10',
    },
  };

  const MAJOR_ICONS: Record<string, string> = {
    DUOC_HOC: 'medication',
    HOA_DUOC: 'science',
    CONG_NGHE_SINH_HOC: 'biotech',
    HOA_HOC: 'experiment',
  };

  const MAJOR_ROUTES: Record<string, string> = {
    HOA_DUOC: '/pharmaceutical-chemistry',
    HOA_HOC: '/chemistry',
    CONG_NGHE_SINH_HOC: '/biotechnology',
    DUOC_HOC: '/pharmacology',
  };

  const DEFAULT_STYLE = {
    bg: 'bg-primary/5',
    border: 'border-primary/10',
    text: 'text-primary',
    hoverBg: 'hover:bg-primary/10',
  };

  return (
    <>
      <div className="min-h-screen p-4 sm:p-8 space-y-8">
        {/* Featured Documents Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-plus-jakarta flex items-center gap-2">
              Tài liệu nổi bật
              <span className="w-2 h-2 rounded-full bg-primary"></span>
            </h2>
            <Link
              href="/all-majors"
              className="text-sm font-bold text-primary hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {featuredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleViewDetail(doc)}
                className="group bg-surface-container-lowest rounded-lg overflow-hidden border border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <span className="material-symbols-outlined text-6xl text-slate-300">
                      description
                    </span>
                  </div>
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-extrabold px-2 py-1 rounded-md shadow-sm uppercase">
                    {doc.mime_type?.split('/')[1] || 'DOC'}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-secondary-container text-[10px] font-bold text-on-secondary-container">
                      {doc.majors?.name || 'Khác'}
                    </span>
                    {doc.academic_year && (
                      <span className="px-3 py-1 rounded-full bg-tertiary-container text-[10px] font-bold text-on-tertiary-container">
                        {doc.academic_year}
                      </span>
                    )}
                  </div>
                  <h3 className="font-plus-jakarta font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      school
                    </span>
                    {doc.subject_name || 'HUP Corner'}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined text-sm">
                          download
                        </span>
                        <span className="text-xs font-medium">856</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined text-sm">
                          visibility
                        </span>
                        <span className="text-xs font-medium">2.1k</span>
                      </div>
                    </div>
                    <button className="p-2 rounded-full hover:bg-primary/10 text-primary transition-all">
                      <span className="material-symbols-outlined">
                        bookmark_add
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Explore by Category Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-plus-jakarta">
            Khám phá theo lĩnh vực
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {majors.map((major) => {
              const style = MAJOR_STYLES[major.code] || DEFAULT_STYLE;
              return (
                <Link
                  key={major.id}
                  href={MAJOR_ROUTES[major.code] || '#'}
                  className={cn(
                    'p-6 rounded-lg border transition-all cursor-pointer group flex flex-col items-center text-center',
                    style.bg,
                    style.border,
                    style.hoverBg
                  )}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span
                      className={cn(
                        'material-symbols-outlined text-3xl',
                        style.text
                      )}
                    >
                      {MAJOR_ICONS[major.code] || 'description'}
                    </span>
                  </div>
                  <h4 className="font-bold font-plus-jakarta mb-1 text-on-surface">
                    {major.name}
                  </h4>
                  <p className="text-xs text-slate-500">Tìm tài liệu</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Uploads Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-plus-jakarta">
            Tải lên gần đây
          </h2>
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 divide-y divide-slate-100 overflow-hidden">
            {recentDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all group cursor-pointer"
                onClick={() => handleViewDetail(doc)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <span className="material-symbols-outlined">
                      description
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm line-clamp-1">{doc.title}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                      Uploaded by{' '}
                      <span className="font-bold text-slate-700">HUP User</span>{' '}
                      • {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {doc.file_size && (
                    <span className="hidden sm:block text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      {(doc.file_size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  )}
                  <button className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-full transition-all">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

    </>
  );
}
