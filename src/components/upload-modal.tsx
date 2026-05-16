'use client';

import React, { useState, useEffect } from 'react';
import { X, CloudUpload, ShieldCheck, CheckCircle2, AlertCircle, ChevronDown, FileText, Loader2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadDocument, getMajors } from '@/lib/supabase';
import { Major, DocumentType } from '@/types/database';
import { useFileUploader } from '@/hooks/use-file-uploader';
import { useGlobalUploads } from '@/hooks/use-global-uploads';

const documentTypeOptions = [
  { value: 'EXAM', label: 'Đề thi' },
  { value: 'SLIDE', label: 'Slide bài giảng' },
  { value: 'TEXTBOOK', label: 'Giáo trình' },
  { value: 'OTHER', label: 'Khác' },
];

const ALLOWED_MAJOR_CODES = ['HOA_DUOC', 'CONG_NGHE_SINH_HOC', 'HOA_HOC', 'DUOC_HOC'];
const FREE_OPTION = { value: '__FREE__', label: 'Khác' };

type UploadStatus = 'form' | 'uploading' | 'success' | 'fail';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [localStatus, setLocalStatus] = useState<UploadStatus | null>(null);
  const { uploads, uploadFile } = useFileUploader();
  const { setUploads } = useGlobalUploads();
  
  // Derived status from global state
  const latestUpload = uploads[uploads.length - 1];
  const globalStatus: UploadStatus = 
    latestUpload?.status === 'uploading' ? 'uploading' :
    latestUpload?.status === 'success' ? 'success' :
    latestUpload?.status === 'error' ? 'fail' : 'form';

  // Use global status for 'uploading' phase, but use local status for final result
  const status = (globalStatus === 'uploading' || localStatus === 'uploading') 
    ? 'uploading' 
    : (localStatus || 'form');

  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    majorId: '',
    documentType: '',
    subjectName: '',
    academicYear: '',
  });
  const [error, setError] = useState('');

  // Load majors from Supabase
  useEffect(() => {
    const loadMajors = async () => {
      try {
        let data = await getMajors();
        if (!data || data.length === 0) {
          await fetch('/api/seed-majors', { method: 'POST' });
          data = await getMajors();
        }
        const filtered = (data || []).filter((m) => ALLOWED_MAJOR_CODES.includes(m.code));
        setMajors(filtered);
      } catch (err) {
        console.error('Error loading majors:', err);
      }
    };
    loadMajors();
  }, []);

  const progress = uploads.length > 0 ? latestUpload?.progress : 0;

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn file');
      return;
    }

    setLocalStatus('uploading');
    setError('');

    try {
      // 1. Upload to Telegram
      const result = await uploadFile(selectedFile);
      if (!result || !result.file_id) {
        throw new Error('Upload thất bại - không nhận được phản hồi từ server');
      }

      // 2. Save to Supabase
      const saved = await uploadDocument({
        title: formData.title,
        document_type: formData.documentType as DocumentType,
        major_id: formData.majorId && formData.majorId !== '__FREE__' ? formData.majorId : null,
        subject_name: formData.subjectName?.toUpperCase() || null,
        academic_year: formData.academicYear || null,
        storage_provider: 'telegram',
        file_path: result.file_id,
        file_name: result.file_name,
        file_size: result.file_size,
        mime_type: selectedFile?.type || null,
      });

      if (!saved?.id) {
        throw new Error('Không thể lưu thông tin tài liệu');
      }

      // 3. Notify Admin
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('documents');
          bc.postMessage({ type: 'uploaded', id: saved?.id });
          bc.close();
        } else if (typeof window !== 'undefined') {
          localStorage.setItem('documents-updated', String(Date.now()));
        }
      } catch (e) {}

      setLocalStatus('success'); 
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi upload');
      setLocalStatus('fail');
    }
  };

  const handleReset = () => {
    setLocalStatus('form');
    setUploads([]); // Clear global uploads to return to form
    setSelectedFile(null);
    setFormData({
      title: '',
      majorId: '',
      documentType: '',
      subjectName: '',
      academicYear: '',
    });
  };

  const handleRetry = () => {
    setLocalStatus('form');
    setUploads([]); // Clear global uploads to return to form
    // Keep formData as requested ("giữ nguyên dữ liệu cũ")
  };

  const handleClose = () => {
    onClose();
    // Delay reset until after transition
    setTimeout(() => {
        if (status === 'success') handleReset();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] relative z-10"
      >
        {/* Modal Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white sticky top-0 z-20">
          <h2 className="text-xl font-plus-jakarta font-extrabold text-on-surface">
            {status === 'form' ? 'Upload Tài Liệu' : 
             status === 'uploading' ? 'Đang Tải Tài Liệu...' : 
             status === 'success' ? 'Đăng Tài Liệu Thành Công' : 'Đăng Tài Liệu Thất Bại'}
          </h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant"
          >
            <X size={24} />
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            {status === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <UploadForm 
                  formData={formData} 
                  setFormData={setFormData} 
                  majors={majors} 
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                />
                {error && <p className="mt-4 text-atelier-error text-xs font-bold text-center">{error}</p>}
              </motion.div>
            )}

            {status === 'uploading' && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 flex flex-col items-center justify-center space-y-10"
              >
                <div className="w-full max-w-md space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-plus-jakarta font-bold text-on-surface-variant uppercase tracking-widest">
                    <span>Vui lòng chờ trong giây lát</span>
                    <span className="text-atelier-primary">{Math.min(progress, 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-atelier-primary rounded-full shadow-[0_0_10px_rgba(51,85,201,0.3)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col items-center text-center">
                   <div className="relative mb-6">
                      <div className="absolute inset-0 bg-atelier-primary/10 rounded-full blur-xl scale-150 animate-pulse" />
                      <CloudUpload size={80} className="text-atelier-primary relative z-10 animate-bounce" style={{ animationDuration: '2s' }} />
                   </div>
                   <p className="text-on-surface font-plus-jakarta font-bold text-lg">Đang tải tài liệu lên...</p>
                   <p className="text-on-surface-variant text-sm mt-1">Hệ thống đang xử lý tệp tin của bạn.</p>
                </div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 flex flex-col items-center justify-center text-center"
              >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-sm">
                  <CheckCircle2 size={56} />
                </div>
                <div className="space-y-2 mb-10">
                  <h3 className="text-3xl font-plus-jakarta font-extrabold text-on-surface">Đăng tài liệu thành công!</h3>
                  <p className="text-on-surface-variant max-w-md">Tài liệu của bạn đã được đưa vào hàng đợi kiểm duyệt. Chúng tôi sẽ thông báo cho bạn khi hoàn tất.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                   <button 
                    onClick={handleClose}
                    className="order-2 sm:order-1 px-6 py-4 bg-surface-container-low text-on-surface-variant font-plus-jakarta font-bold text-sm hover:bg-surface-container-high rounded-full transition-all"
                  >
                    OK
                  </button>
                  <button 
                    onClick={handleReset}
                    className="order-1 sm:order-2 bg-gradient-to-br from-[#3355c9] to-[#6e3bd8] text-on-primary font-plus-jakarta font-bold px-8 py-4 rounded-full shadow-[0px_10px_25px_rgba(51,85,201,0.25)] hover:translate-y-[-2px] active:scale-95 transition-all text-sm"
                  >
                    Đăng tài liệu tiếp
                  </button>
                </div>

                {/* List of files pending */}
                <div className="w-full mt-12 text-left border-t border-slate-100 pt-8">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-[11px] font-plus-jakarta font-bold text-on-surface-variant uppercase tracking-[0.2em]">File vừa đăng tải</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-slate-100 group hover:border-atelier-primary/30 transition-colors">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-atelier-primary">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface font-bold truncate">{formData.title || "Tài liệu vừa xong"}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase font-medium">
                          {documentTypeOptions.find(o => o.value === formData.documentType)?.label || "Tài liệu"} • {selectedFile?.name}
                        </p>
                      </div>
                      <div className="text-[10px] font-bold text-tertiary bg-tertiary-container/20 px-2 py-1 rounded-md">
                        ĐANG CHỜ DUYỆT
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {status === 'fail' && (
              <motion.div
                key="fail"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-atelier-error mb-6">
                  <AlertCircle size={56} />
                </div>
                <div className="space-y-2 mb-10">
                  <h3 className="text-3xl font-plus-jakarta font-extrabold text-on-surface">Đăng tài liệu thất bại</h3>
                  <p className="text-on-surface-variant max-w-sm mx-auto">Đã xảy ra lỗi hệ thống trong quá trình tải lên. Vui lòng kiểm tra lại kết nối và thử lại.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                   <button 
                    onClick={handleClose}
                    className="flex-1 px-6 py-4 border border-slate-200 text-on-surface-variant font-plus-jakarta font-bold text-sm hover:bg-surface-container-low rounded-full transition-all"
                  >
                    Thoát
                  </button>
                  <button 
                    onClick={handleRetry}
                    className="flex-1 bg-gradient-to-br from-[#3355c9] to-[#6e3bd8] text-on-primary font-plus-jakarta font-bold px-8 py-4 rounded-full shadow-[0px_10px_25px_rgba(51,85,201,0.25)] hover:translate-y-[-2px] active:scale-95 transition-all text-sm"
                  >
                    Đăng lại
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer (Only shown in 'form' state) */}
        {status === 'form' && (
          <footer className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-4 bg-surface-container-lowest sticky bottom-0">
            <button 
              onClick={handleClose}
              className="px-6 py-3 text-on-surface-variant font-plus-jakarta font-bold text-sm hover:bg-surface-container-low rounded-full transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!formData.title || !formData.documentType || !selectedFile}
              className="bg-gradient-to-br from-[#3355c9] to-[#6e3bd8] text-on-primary font-plus-jakarta font-bold px-8 py-4 rounded-full shadow-[0px_10px_25px_rgba(51,85,201,0.25)] hover:translate-y-[-2px] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:pointer-events-none"
              type="button"
            >
              Đăng tải ngay
            </button>
          </footer>
        )}
      </motion.div>
    </div>
  );
}

function UploadForm({ 
  formData, 
  setFormData, 
  majors, 
  selectedFile, 
  setSelectedFile 
}: { 
  formData: any, 
  setFormData: any, 
  majors: Major[], 
  selectedFile: File | null, 
  setSelectedFile: any 
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const majorOptions = [
    ...majors.map((m) => ({
      value: m.id,
      label: m.name,
    })),
    FREE_OPTION,
  ];

  return (
    <div className="space-y-6">
      {/* Tên tài liệu */}
      <div className="space-y-2">
        <label className="block font-plus-jakarta font-bold text-[10px] text-on-surface-variant tracking-[0.15em] uppercase px-2">Tên tài liệu *</label>
        <input 
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full bg-surface-container-low border border-slate-100 rounded-full px-6 py-4 focus:ring-4 focus:ring-atelier-primary/10 focus:border-atelier-primary outline-none transition-all placeholder:text-slate-400 text-sm font-medium" 
          placeholder="Ví dụ: Đề thi Hoá Dược 1 - Học kỳ 1 năm 2024" 
          type="text"
          required
        />
      </div>

      {/* 2-column Grid: Ngành học & Loại tài liệu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="block font-plus-jakarta font-bold text-[10px] text-on-surface-variant tracking-[0.15em] uppercase px-2">Ngành học</label>
          <div className="relative">
            <select 
              name="majorId"
              value={formData.majorId}
              onChange={handleChange}
              className="w-full appearance-none bg-surface-container-low border border-slate-100 rounded-full px-6 py-4 focus:ring-4 focus:ring-atelier-primary/10 focus:border-atelier-primary outline-none transition-all text-on-surface text-sm font-medium cursor-pointer"
            >
              <option value="">Chọn ngành học</option>
              {majorOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" size={18} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block font-plus-jakarta font-bold text-[10px] text-on-surface-variant tracking-[0.15em] uppercase px-2">Loại tài liệu *</label>
          <div className="relative">
            <select 
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-full appearance-none bg-surface-container-low border border-slate-100 rounded-full px-6 py-4 focus:ring-4 focus:ring-atelier-primary/10 focus:border-atelier-primary outline-none transition-all text-on-surface text-sm font-medium cursor-pointer"
              required
            >
              <option value="">Chọn loại tài liệu</option>
              {documentTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" size={18} />
          </div>
        </div>
      </div>

      {/* 2-column Grid: Tên môn học & Năm học */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="block font-plus-jakarta font-bold text-[10px] text-on-surface-variant tracking-[0.15em] uppercase px-2">Tên môn học</label>
          <input 
            name="subjectName"
            value={formData.subjectName}
            onChange={handleChange}
            className="w-full bg-surface-container-low border border-slate-100 rounded-full px-6 py-4 focus:ring-4 focus:ring-atelier-primary/10 focus:border-atelier-primary outline-none transition-all placeholder:text-slate-400 text-sm font-medium" 
            placeholder="Ví dụ: Hoá Dược 1" 
            type="text"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-plus-jakarta font-bold text-[10px] text-on-surface-variant tracking-[0.15em] uppercase px-2">Năm học</label>
          <input 
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            className="w-full bg-surface-container-low border border-slate-100 rounded-full px-6 py-4 focus:ring-4 focus:ring-atelier-primary/10 focus:border-atelier-primary outline-none transition-all placeholder:text-slate-400 text-sm font-medium" 
            placeholder="Ví dụ: 2024-2025" 
            type="text"
          />
        </div>
      </div>

      {/* Dropzone */}
      <div className="space-y-2">
        <label className="block font-plus-jakarta font-bold text-[10px] text-on-surface-variant tracking-[0.15em] uppercase">Tải tệp tin lên *</label>
        <div 
          onClick={() => document.getElementById('file-input')?.click()}
          className={`group relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 transition-all cursor-pointer ${selectedFile ? 'border-atelier-primary bg-atelier-primary/5' : 'border-primary-container bg-surface-container-low hover:bg-surface-container-high hover:border-atelier-primary'}`}
        >
          <div className={`mb-4 p-4 rounded-full shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300 ${selectedFile ? 'bg-atelier-primary text-white' : 'bg-white text-atelier-primary'}`}>
            {selectedFile ? <CheckCircle2 size={36} /> : <CloudUpload size={36} />}
          </div>
          <div className="text-center">
            <p className="text-on-surface font-bold text-base">
              {selectedFile ? selectedFile.name : 'Kéo và thả tệp vào đây'}
            </p>
            <p className="text-on-surface-variant text-[11px] mt-1 font-medium">
              {selectedFile ? `(${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)` : 'Hỗ trợ PDF, DOCX, PPTX, JPG, PNG (Tối đa 50MB)'}
            </p>
          </div>
          <input 
            id="file-input"
            className="hidden" 
            type="file" 
            accept=".pdf,.pptx,.docx,.doc,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Security Info */}
      <div className="flex items-center gap-3 text-on-tertiary-fixed-variant bg-tertiary-container/10 p-4 rounded-xl border border-tertiary/10">
        <ShieldCheck size={22} className="text-tertiary" />
        <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none">Tài liệu sẽ được kiểm duyệt trong vòng 24h</span>
      </div>
    </div>
  );
}
