'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select, Title } from 'rizzui';
import { PiUploadSimpleBold, PiCheckCircleBold } from 'react-icons/pi';
import { uploadDocument, getMajors } from '@/lib/supabase';
import { Major, DocumentType } from '@/types/database';
import { useFileUploader } from '@/hooks/use-file-uploader';

const documentTypeOptions = [
  { value: 'EXAM', label: 'Đề thi' },
  { value: 'SLIDE', label: 'Slide bài giảng' },
  { value: 'TEXTBOOK', label: 'Giáo trình' },
  { value: 'OTHER', label: 'Khác' },
];

// Chỉ hiển thị 4 ngành chính + Tự do
const ALLOWED_MAJOR_CODES = ['HOA_DUOC', 'CONG_NGHE_SINH_HOC', 'HOA_HOC', 'DUOC_HOC'];
const FREE_OPTION = { value: '__FREE__', label: 'Khác' };

export default function UploadForm() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    majorId: '',
    subjectName: '',
    academicYear: '',
    documentType: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const { uploads, uploadFile } = useFileUploader();

  useEffect(() => {
    loadMajors();
  }, []);

  const loadMajors = async () => {
    try {
      let data = await getMajors();

      // If no majors found, auto-seed them
      if (!data || data.length === 0) {
        try {
          await fetch('/api/seed-majors', { method: 'POST' });
          data = await getMajors();
        } catch (seedErr) {
          // Error seeding majors
        }
      }

      // Chỉ giữ 4 ngành chính
      const filtered = (data || []).filter((m) => ALLOWED_MAJOR_CODES.includes(m.code));
      setMajors(filtered);
    } catch (err) {
      // Error loading majors
    }
  };

  const majorOptions = [
    ...majors.map((m) => ({
      value: m.id,
      label: m.name,
    })),
    FREE_OPTION,
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Vui lòng chọn file');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Upload file using the hook (with progress tracking)
      const result = await uploadFile(selectedFile);

      if (!result || !result.file_id) {
        throw new Error('Upload thất bại - không nhận được file_id từ Telegram');
      }

      // file_id is either:
      // - Single file: "file_id123"
      // - Chunked: "chunk:file_id1,file_id2,file_id3,..."
      // Both formats are already handled by parseTelegramFilePath in telegram.ts

      // Lưu record vào Supabase DB với status PENDING
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
      });

      if (!saved?.id) {
        throw new Error('Upload thất bại - không nhận được document ID');
      }

      // Notify other tabs (admin dashboard) that a new document was uploaded
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('documents');
          bc.postMessage({ type: 'uploaded', id: saved?.id });
          bc.close();
        } else if (typeof window !== 'undefined') {
          // fallback: use localStorage event
          localStorage.setItem('documents-updated', String(Date.now()));
        }
      } catch (err) {
        // no-op
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi upload');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <div className="text-center py-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <PiCheckCircleBold className="h-10 w-10 text-green-600" />
          </div>
          <Title as="h2" className="text-2xl font-bold text-gray-900 mb-2">
            Đăng tải thành công!
          </Title>
          <p className="text-gray-600 mb-6">
            Tài liệu của bạn đã được gửi và đang chờ admin duyệt.
            <br />
            Sau khi được duyệt, tài liệu sẽ xuất hiện trên trang.
          </p>
          <Button
            onClick={() => {
              setIsSubmitted(false);
              setSelectedFile(null);
              setFormData({
                title: '',
                majorId: '',
                subjectName: '',
                academicYear: '',
                documentType: '',
              });
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Đăng tài liệu khác
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
      <div className="mb-6">
        <Title as="h1" className="text-2xl font-bold text-gray-900">
          Upload Tài Liệu
        </Title>
        <p className="mt-2 text-gray-600">
          Chia sẻ tài liệu học tập với cộng đồng. Tài liệu sẽ được duyệt trước khi hiển thị.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Tên tài liệu *"
          placeholder="VD: Đề thi Hoá Dược 1 - Học kỳ 1 năm 2024"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Ngành học"
            options={majorOptions}
            value={majorOptions.find((o) => o.value === formData.majorId) ?? null}
            onChange={(option: any) =>
              setFormData({ ...formData, majorId: option?.value || '' })
            }
            placeholder="Chọn ngành học"
          />

          <Select
            label="Loại tài liệu *"
            options={documentTypeOptions}
            value={documentTypeOptions.find((o) => o.value === formData.documentType) ?? null}
            onChange={(option: any) =>
              setFormData({ ...formData, documentType: option?.value || '' })
            }
            placeholder="Chọn loại tài liệu"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tên môn học"
            placeholder="VD: Hoá Dược 1"
            value={formData.subjectName}
            onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
          />

          <Input
            label="Năm học"
            placeholder="VD: 2024-2025"
            value={formData.academicYear}
            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
          />
        </div>

        <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
          <PiUploadSimpleBold className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Kéo thả file vào đây hoặc click để chọn file
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Hỗ trợ: PDF, PPTX, DOCX, DOC, JPG, PNG (Tối đa 50MB)
          </p>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.pptx,.docx,.doc,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => {
              document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
            }}
          >
            Chọn file
          </Button>
          {selectedFile && (
            <p className="mt-3 text-sm text-green-600">
              Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
            </p>
          )}

          {/* Progress Bar */}
          {uploads.length > 0 && uploads[0]?.status === 'uploading' && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Đang tải lên...</span>
                <span className="font-semibold text-gray-700">{uploads[0]?.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploads[0]?.progress || 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Success Message */}
          {uploads.length > 0 && uploads[0]?.status === 'success' && (
            <p className="mt-3 text-sm text-green-600">
              ✓ Upload thành công!
            </p>
          )}

          {/* Upload Error Message */}
          {uploads.length > 0 && uploads[0]?.status === 'error' && (
            <p className="mt-3 text-sm text-red-600">
              ✗ {uploads[0]?.message || 'Upload thất bại'}
            </p>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700"
          isLoading={loading}
          disabled={!formData.title || !formData.documentType || !selectedFile}
        >
          <PiUploadSimpleBold className="mr-2 h-5 w-5" />
          Đăng tải tài liệu
        </Button>
      </form>
    </div>
  );
}
