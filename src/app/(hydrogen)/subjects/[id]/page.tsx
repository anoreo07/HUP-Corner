import React from 'react';
import { getSubjectById, getDocumentsBySubject } from '@/lib/supabase';
import { metaObject } from '@/config/site.config';
import { 
  BookOpen, 
  BookText, 
  GraduationCap, 
  ArrowLeft,
  Calendar,
  Layers,
  FileText,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DocumentCard } from '@/app/shared/document-card';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const subject = await getSubjectById(params.id);
  if (!subject) return metaObject('Không tìm thấy môn học');
  return metaObject(subject.name);
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SubjectDetailPage({ params }: { params: { id: string } }) {
  const [subject, documents] = await Promise.all([
    getSubjectById(params.id),
    getDocumentsBySubject(params.id)
  ]);

  if (!subject) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 mb-20">
      <Link href="/subjects" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest mb-8">
        <ArrowLeft size={16} />
        Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Subject Info */}
        <section className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 shadow-[0px_40px_100px_rgba(13,52,89,0.06)]">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8">
                <BookOpen size={32} />
            </div>
            
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 block">
              Chi tiết học phần
            </span>
            <h1 className="text-3xl font-black text-on-surface font-plus-jakarta tracking-tight leading-tight mb-8">
              {subject.name}
            </h1>

            <div className="space-y-6">
              <DetailRow label="Mã học phần" value={subject.code} icon={<Layers size={18} />} />
              <DetailRow label="Số tín chỉ" value={`${subject.credits} tín chỉ`} icon={<BookText size={18} />} />
              <DetailRow 
                label="Tổng số tiết" 
                value={`${subject.theory_hours + subject.practice_hours + subject.exercise_hours + subject.seminar_hours} tiết`} 
                icon={<Clock size={18} />} 
              />
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50">
              <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-6">
                Phân bổ giờ học
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <HourBox label="Lý thuyết" hours={subject.theory_hours} />
                <HourBox label="Thực hành" hours={subject.practice_hours} />
                <HourBox label="Bài tập" hours={subject.exercise_hours} />
                <HourBox label="Seminar" hours={subject.seminar_hours} />
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Documents */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-2xl font-black text-on-surface tracking-tight font-plus-jakarta">Tài liệu học tập</h2>
              <p className="text-on-surface-variant text-sm mt-1 font-medium">Tìm thấy {documents.length} tài liệu cho môn học này.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}

            {documents.length === 0 && (
              <div className="col-span-full py-24 text-center bg-surface-container-low rounded-[3rem] border border-dashed border-slate-200">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-500">Chưa có tài liệu</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Môn học này hiện chưa có tài liệu nào được đăng tải và kiểm duyệt.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 text-primary opacity-60">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-bold text-on-surface tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function HourBox({ label, hours }: { label: string, hours: number }) {
  return (
    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-primary font-plus-jakarta">{hours}<span className="text-[10px] ml-1 opacity-60">tiết</span></p>
    </div>
  );
}
