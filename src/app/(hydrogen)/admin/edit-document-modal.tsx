'use client';

import { useState } from 'react';
import { Modal, Button, Input, Title } from 'rizzui';
import { toast } from 'react-hot-toast';
import { DocumentWithMajor, DocumentType } from '@/types/database';

interface EditDocumentModalProps {
  isOpen: boolean;
  document: DocumentWithMajor | null;
  majors: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: (documentId: string, data: { title: string; subject_name: string; academic_year: string }) => Promise<void>;
}

const documentTypeLabels: Record<DocumentType, string> = {
  EXAM: 'Đề thi',
  SLIDE: 'Slide bài giảng',
  TEXTBOOK: 'Giáo trình',
  OTHER: 'Khác',
};

export function EditDocumentModal({
  isOpen,
  document,
  majors,
  onClose,
  onSave,
}: EditDocumentModalProps) {
  const [formData, setFormData] = useState({
    title: document?.title || '',
    subject_name: document?.subject_name || '',
    academic_year: document?.academic_year || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    setLoading(true);
    try {
      await onSave(document.id, formData);
      onClose();
      toast.success('Cập nhật thành công!');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Có lỗi khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full"
    >
      {document && (
        <div className="w-full max-w-3xl mx-auto">
          <div className="space-y-6 p-8 bg-white rounded-lg">
            <Title as="h2" className="text-3xl font-bold text-center">
              📝 Sửa thông tin tài liệu
            </Title>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Tiêu đề
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề"
                  required
                  className="w-full"
                />
              </div>

              {/* Subject Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Tên môn học
                </label>
                <Input
                  name="subject_name"
                  value={formData.subject_name}
                  onChange={handleChange}
                  placeholder="Nhập tên môn học"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  <strong>💡 Lưu ý:</strong> Tên môn học sẽ tự động viết HOA khi upload tài liệu
                </p>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Năm học
                </label>
                <Input
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                  placeholder="VD: 2024-2025"
                  className="w-full"
                />
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-5 space-y-3">
                <p className="text-sm text-blue-900">
                  <strong>📁 Ngành:</strong> {document.majors?.name || '(Khác)'}
                </p>
                <p className="text-sm text-blue-900">
                  <strong>📄 Loại:</strong> {documentTypeLabels[document.document_type]}
                </p>
                <p className="text-sm text-blue-900">
                  <strong>✓ Trạng thái:</strong> <span className="font-semibold">{document.status}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 py-3 text-base font-semibold"
                  onClick={onClose}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 py-3 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  disabled={loading}
                >
                  {loading ? '⏳ Đang lưu...' : '💾 Lưu'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
}
