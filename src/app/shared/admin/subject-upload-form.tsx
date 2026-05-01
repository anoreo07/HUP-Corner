'use client';

import React, { useState, useEffect } from 'react';
import { 
  CloudUpload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowLeft,
  Search,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadDocument, getSubjects } from '@/lib/supabase';
import { Subject, DocumentType } from '@/types/database';
import { useFileUploader } from '@/hooks/use-file-uploader';
import { Select, Button, Input } from 'rizzui';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const documentTypeOptions = [
  { value: 'EXAM', label: 'Đề thi' },
  { value: 'SLIDE', label: 'Slide bài giảng' },
  { value: 'TEXTBOOK', label: 'Giáo trình' },
  { value: 'OTHER', label: 'Khác' },
];

const labelClasses = "font-black text-[10px] uppercase tracking-widest text-slate-500 mb-2 block px-1";


export default function SubjectDocumentUploadForm() {
  const [status, setStatus] = useState<'form' | 'uploading' | 'success'>('form');
  const { uploads, uploadFile } = useFileUploader();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    documentType: '',
    academicYear: '',
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
    if (!selectedFile || !formData.subjectId || !formData.documentType || !formData.title) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setStatus('uploading');
    setError('');

    try {
      // Extract values if they are objects (from RizzUI Select)
      const subjectId = typeof formData.subjectId === 'object' 
        ? (formData.subjectId as any).value 
        : formData.subjectId;
        
      const documentType = typeof formData.documentType === 'object' 
        ? (formData.documentType as any).value 
        : formData.documentType;

      // 1. Upload to Telegram
      const result = await uploadFile(selectedFile);
      if (!result || !result.file_id) {
        throw new Error('Upload lên Telegram thất bại');
      }

      // 2. Find subject name for legacy support if needed
      const selectedSubject = subjects.find(s => s.id === subjectId);

      // 3. Save to Supabase
      await uploadDocument({
        title: formData.title,
        document_type: documentType as DocumentType,
        subject_id: subjectId,
        subject_name: selectedSubject?.name || null,
        major_id: selectedSubject?.major_id || null,
        academic_year: formData.academicYear || null,
        storage_provider: 'telegram',
        file_path: result.file_id,
        file_name: result.file_name,
        file_size: result.file_size,
        mime_type: selectedFile?.type || null,
        status: 'APPROVED' // Auto-approve for admin
      });


      setStatus('success');
      toast.success('Đã tải lên và phê duyệt tài liệu thành công');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi upload');
      setStatus('form');
    }
  };

  const subjectOptions = subjects.map(s => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
  }));

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl text-center border border-slate-100"
      >
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={56} />
        </div>
        <h2 className="text-3xl font-black text-on-surface mb-4">Hoàn tất!</h2>
        <p className="text-slate-500 mb-10">Tài liệu đã được tải lên và tự động phê duyệt vào hệ thống.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/admin">
            <Button size="lg" variant="outline" className="rounded-full w-full sm:w-auto">Quay lại Dashboard</Button>
          </Link>
          <Button size="lg" onClick={() => {
            setStatus('form');
            setSelectedFile(null);
            setFormData({ title: '', subjectId: '', documentType: '', academicYear: '' });
          }} className="rounded-full w-full sm:w-auto">Tiếp tục đăng tài liệu</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest mb-8">
        <ArrowLeft size={16} />
        Hệ thống quản trị
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0px_40px_100px_rgba(13,52,89,0.06)] border border-slate-100 overflow-hidden">
        <div className="p-10 md:p-14">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <CloudUpload size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-on-surface font-plus-jakarta tracking-tight">Đăng tài liệu môn học</h1>
              <p className="text-sm text-slate-500">Giao diện dành riêng cho Admin</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Input
                  label="Tên tài liệu"
                  placeholder="Nhập tên tài liệu..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  labelClassName={labelClasses}
                  inputClassName="rounded-xl border-slate-100"
                />

                <Select
                  label="Chọn môn học"
                  placeholder="Tìm kiếm môn học..."
                  options={subjectOptions}
                  value={formData.subjectId}
                  onChange={(val: string) => setFormData({...formData, subjectId: val})}
                  searchable
                  labelClassName={labelClasses}
                  selectClassName="rounded-xl border-slate-100"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Loại tài liệu"
                    options={documentTypeOptions}
                    value={formData.documentType}
                    onChange={(val: string) => setFormData({...formData, documentType: val})}
                    labelClassName={labelClasses}
                    selectClassName="rounded-xl border-slate-100"
                  />
                  <Input
                    label="Năm học"
                    placeholder="2024-2025"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                    labelClassName={labelClasses}
                    inputClassName="rounded-xl border-slate-100"
                  />
                </div>

              </div>

              <div className="space-y-6">
                <label className="block font-black text-[10px] text-slate-500 uppercase tracking-widest px-1">Tệp tin tài liệu</label>
                <div 
                  onClick={() => document.getElementById('admin-file-input')?.click()}
                  className={`group relative flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] p-12 h-full min-h-[250px] transition-all cursor-pointer ${selectedFile ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary hover:bg-slate-50'}`}
                >
                  <div className={`mb-6 p-5 rounded-3xl shadow-sm transition-all duration-300 ${selectedFile ? 'bg-primary text-white' : 'bg-white text-primary border border-slate-100'}`}>
                    {selectedFile ? <CheckCircle2 size={40} /> : <FileText size={40} />}
                  </div>
                  <div className="text-center">
                    <p className="text-on-surface font-black text-sm">
                      {selectedFile ? selectedFile.name : 'Chọn hoặc thả tệp vào đây'}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-2 font-medium">
                      {selectedFile ? `(${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)` : 'Hỗ trợ PDF, DOCX, PPTX, Ảnh'}
                    </p>
                  </div>
                  <input 
                    id="admin-file-input"
                    className="hidden" 
                    type="file" 
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>

            {status === 'uploading' && (
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-[11px] font-black text-primary uppercase tracking-widest">
                  <span>Đang tải lên...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-xs font-bold">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="pt-6">
              <Button 
                type="submit" 
                size="xl" 
                disabled={status === 'uploading'}
                className="w-full rounded-2xl h-16 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                {status === 'uploading' ? 'Đang xử lý...' : 'Đăng và Phê duyệt ngay'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
