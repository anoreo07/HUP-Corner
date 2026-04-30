'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DocumentWithMajor, Major } from '@/types/database';
import cn from '@core/utils/class-names';
import { DocumentCard } from './document-card';

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
  console.log('Dashboard Data:', { featuredDocuments, recentDocuments });
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
          {featuredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDocuments.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-surface-container-lowest rounded-[2rem] border-2 border-dashed border-outline-variant/20">
              <span className="material-symbols-outlined text-4xl text-outline-variant/30 mb-2">description</span>
              <p className="text-on-surface-variant font-medium">Hiện tại chưa có tài liệu nổi bật nào.</p>
            </div>
          )}
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
