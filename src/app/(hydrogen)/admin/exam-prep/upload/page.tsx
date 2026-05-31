'use client';

import React, { useState, useEffect } from 'react';
import { 
  CloudUpload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowLeft,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { uploadDocument, getSubjects } from '@/lib/supabase';
import { Subject, DocumentType } from '@/types/database';
import { useFileUploader } from '@/hooks/use-file-uploader';
import { Select, Button, Input, Textarea } from 'rizzui';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const labelClasses = "font-black text-[10px] uppercase tracking-widest text-slate-500 mb-2 block px-1";

export default function ExamPrepUploadPage() {
  const [status, setStatus] = useState<'form' | 'uploading' | 'success'>('form');
  const { uploads, uploadFile } = useFileUploader();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    academicYear: '',
    lecturerName: '',
    faculty: '',
    description: '',
  });
  const [error, setError] = useState('');

  // Load subjects
  useEffect(() => {
    getSubjects().then(setSubjects).catch(console.error);
  }, []);

  const latestUpload = uploads[uploads.length - 1];
  const progress = latestUpload?.progress || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.subjectId || !formData.title) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc (Tiêu đề, Môn học, và Tệp tin)');
      return;
    }

    setStatus('uploading');
    setError('');

    try {
      // Extract values if they are objects (from RizzUI Select)
      const subjectId = typeof formData.subjectId === 'object' 
        ? (formData.subjectId as any).value 
        : formData.subjectId;

      // 1. Upload to Telegram
      const result = await uploadFile(selectedFile);
      if (!result || !result.file_id) {
        throw new Error('Tải tệp lên Telegram thất bại. Vui lòng kiểm tra lại kết nối.');
      }

      // 2. Find subject metadata
      const selectedSubject = subjects.find(s => s.id === subjectId);

      // 3. Save to Supabase as OUTLINE with status APPROVED (no category needed for outlines)
      await uploadDocument({
        title: formData.title,
        document_type: 'OUTLINE' as DocumentType,
        subject_id: subjectId,
        subject_name: selectedSubject?.name || null,
        major_id: selectedSubject?.major_id || null,
        category: null,
        telegram_bot_index: result.telegram_bot_index || 1,
        academic_year: formData.academicYear || null,
        lecturer_name: formData.lecturerName || null,
        faculty: formData.faculty || null,
        description: formData.description || null,
        storage_provider: 'telegram',
        file_path: result.file_id,
        file_name: result.file_name,
        file_size: result.file_size,
        mime_type: selectedFile?.type || null,
        status: 'APPROVED'
      });

      setStatus('success');
      toast.success('Đăng đề cương ôn thi thành công!');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải lên');
      setStatus('form');
    }
  };

  const subjectOptions = subjects.map(s => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
  }));

  if (status === 'success') {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl text-center border border-slate-100 dark:border-slate-800 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 -translate-y-6 translate-x-6 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
          <div className="w-24 h-24 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 size={56} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white font-plus-jakarta mb-4">Đăng đề cương thành công!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto font-medium text-sm">
            Đề cương đã được tải lên lưu trữ Telegram, đồng bộ vào cơ sở dữ liệu và hiển thị ngay lập tức trong mục ôn thi của sinh viên.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin">
              <Button size="lg" variant="outline" className="rounded-full w-full sm:w-auto font-bold">
                Quay lại Dashboard
              </Button>
            </Link>
            <Button 
              size="lg" 
              onClick={() => {
                setStatus('form');
                setSelectedFile(null);
                setFormData({
                  title: '',
                  subjectId: '',
                  academicYear: '',
                  lecturerName: '',
                  faculty: '',
                  description: '',
                });
              }} 
              className="rounded-full w-full sm:w-auto font-bold bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20"
            >
              Tiếp tục đăng đề cương
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest">
            <ArrowLeft size={16} />
            Hệ thống quản trị
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full text-[9px] font-black uppercase tracking-widest text-primary border border-primary/10">
            <Sparkles size={11} className="text-primary animate-pulse" />
            Đề cương Ôn thi
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0px_40px_100px_rgba(13,52,89,0.05)] border border-slate-100/80 dark:border-slate-800 overflow-hidden relative">
          <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-[24rem] h-[24rem] bg-primary/5 rounded-full blur-3xl" />
          
          <div className="p-8 md:p-14 relative z-10">
            <div className="flex items-center gap-5 mb-12">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-3xl flex items-center justify-center shadow-sm">
                <BookOpen size={26} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white font-plus-jakarta tracking-tight leading-none">
                  Tải lên Đề cương Ôn thi
                </h1>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  Thiết lập thông tin và tải lên tài liệu học tập dành riêng cho Admin
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form fields */}
                <div className="lg:col-span-7 space-y-6">
                  <Input
                    label="Tên đề cương / Tiêu đề"
                    placeholder="Ví dụ: Đề cương Hóa lý 1 chi tiết..."
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    labelClassName={labelClasses}
                    inputClassName="rounded-2xl border-slate-100 hover:border-primary/30 focus:border-primary transition-all px-4 py-3"
                  />

                  <Select
                    label="Môn học liên quan"
                    placeholder="Tìm kiếm môn học..."
                    options={subjectOptions}
                    value={formData.subjectId}
                    onChange={(val: string) => setFormData({...formData, subjectId: val})}
                    searchable
                    labelClassName={labelClasses}
                    selectClassName="rounded-2xl border-slate-100 hover:border-primary/30 focus:border-primary transition-all"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Năm học ôn thi"
                      placeholder="Ví dụ: 2024-2025"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                      labelClassName={labelClasses}
                      inputClassName="rounded-2xl border-slate-100 hover:border-primary/30 focus:border-primary transition-all px-4 py-3"
                    />
                    <Input
                      label="Khoa / Bộ môn"
                      placeholder="Ví dụ: Khoa Dược học"
                      value={formData.faculty}
                      onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                      labelClassName={labelClasses}
                      inputClassName="rounded-2xl border-slate-100 hover:border-primary/30 focus:border-primary transition-all px-4 py-3"
                    />
                  </div>

                  <Input
                    label="Giảng viên phụ trách"
                    placeholder="Ví dụ: TS. Nguyễn Văn A"
                    value={formData.lecturerName}
                    onChange={(e) => setFormData({...formData, lecturerName: e.target.value})}
                    labelClassName={labelClasses}
                    inputClassName="rounded-2xl border-slate-100 hover:border-primary/30 focus:border-primary transition-all px-4 py-3"
                  />

                  <Textarea
                    label="Mô tả tóm tắt"
                    placeholder="Nhập mô tả ngắn gọn về nội dung hoặc lưu ý của đề cương..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    labelClassName={labelClasses}
                    textareaClassName="rounded-2xl border-slate-100 hover:border-primary/30 focus:border-primary transition-all px-4 py-3 min-h-[100px]"
                  />
                </div>

                {/* File Dropzone */}
                <div className="lg:col-span-5 flex flex-col">
                  <span className={labelClasses}>Tệp tin đề cương</span>
                  <div 
                    onClick={() => document.getElementById('admin-outline-file-input')?.click()}
                    className={`group relative flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] p-10 flex-1 min-h-[300px] transition-all duration-300 cursor-pointer ${
                      selectedFile 
                        ? 'border-primary bg-primary/5 dark:bg-primary/5' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <div className={`mb-6 p-5 rounded-3xl shadow-sm transition-all duration-300 ${
                      selectedFile 
                        ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' 
                        : 'bg-white dark:bg-slate-800 text-primary border border-slate-100 dark:border-slate-700'
                    }`}>
                      {selectedFile ? <CheckCircle2 size={40} /> : <FileText size={40} />}
                    </div>
                    <div className="text-center">
                      <p className="text-slate-800 dark:text-slate-200 font-bold text-sm leading-snug px-4">
                        {selectedFile ? selectedFile.name : 'Chọn hoặc kéo thả đề cương vào đây'}
                      </p>
                      <p className="text-slate-400 text-[10px] mt-2 font-medium">
                        {selectedFile ? `(${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)` : 'Hỗ trợ định dạng PDF, DOC, DOCX, PPTX'}
                      </p>
                    </div>
                    <input 
                      id="admin-outline-file-input"
                      className="hidden" 
                      type="file" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </div>

              {status === 'uploading' && (
                <div className="space-y-4 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100/50 dark:border-slate-800">
                  <div className="flex justify-between items-center text-[10px] font-black text-primary uppercase tracking-widest">
                    <span>Đang mã hóa & tải lên Telegram...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-100/50 dark:border-red-900/30">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  size="xl" 
                  disabled={status === 'uploading'}
                  className="w-full lg:w-auto px-10 rounded-2xl h-16 font-black text-xs uppercase tracking-widest bg-primary hover:bg-primary-hover text-white shadow-xl shadow-primary/20 active:scale-98 transition-all"
                >
                  {status === 'uploading' ? 'Đang tải lên...' : 'Đăng tải & Phê duyệt Ngay'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
