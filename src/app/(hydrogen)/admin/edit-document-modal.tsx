'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input, Title, ActionIcon, Select } from 'rizzui';
import { toast } from 'react-hot-toast';
import { DocumentWithMajor, DocumentType } from '@/types/database';
import { PiXBold, PiPencilCircleFill, PiInfoFill } from 'react-icons/pi';
import cn from '@core/utils/class-names';

interface EditDocumentModalProps {
  isOpen: boolean;
  document: DocumentWithMajor | null;
  majors: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: (documentId: string, data: { title: string; subject_name: string; academic_year: string; category?: 'THEORY' | 'PRACTICAL' | null }) => Promise<void>;
}

const documentTypeLabels: Record<DocumentType, string> = {
  EXAM: 'Đề thi',
  SLIDE: 'Slide bài giảng',
  TEXTBOOK: 'Giáo trình',
  OUTLINE: 'Đề cương',
  OTHER: 'Khác',
};

export function EditDocumentModal({
  isOpen,
  document: doc,
  majors,
  onClose,
  onSave,
}: EditDocumentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    subject_name: '',
    academic_year: '',
    category: 'THEORY' as 'THEORY' | 'PRACTICAL' | null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doc) {
      setFormData({
        title: doc.title || '',
        subject_name: doc.subject_name || '',
        academic_year: doc.academic_year || '',
        category: doc.category || 'THEORY',
      });
    }
  }, [doc]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc) return;

    setLoading(true);
    try {
      await onSave(doc.id, formData);
      onClose();
    } catch (error) {
      toast.error('Có lỗi khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      customSize="600px"
      overlayClassName="backdrop-blur-sm"
      containerClassName="p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl"
    >
      {doc && (
        <div className="bg-white">
          {/* Header */}
          <div className="relative p-8 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <PiPencilCircleFill size={32} />
              </div>
              <div>
                <Title as="h2" className="text-2xl font-black text-slate-900 tracking-tight font-plus-jakarta">
                  Cập nhật tài liệu
                </Title>
                <p className="text-sm font-medium text-slate-500">Chỉnh sửa thông tin học thuật của tài liệu</p>
              </div>
            </div>
            <ActionIcon
              variant="text"
              onClick={onClose}
              className="absolute top-6 right-6 rounded-full hover:bg-white transition-colors"
            >
              <PiXBold size={20} className="text-slate-400" />
            </ActionIcon>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên tài liệu</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="VD: Đề thi giải tích 1 - K76"
                  required
                  className="[&>div]:rounded-2xl [&>div]:bg-slate-50 [&>div]:border-none [&_input]:font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Môn học</label>
                  <Input
                    name="subject_name"
                    value={formData.subject_name}
                    onChange={handleChange}
                    placeholder="VD: Giải tích 1"
                    className="[&>div]:rounded-2xl [&>div]:bg-slate-50 [&>div]:border-none [&_input]:font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Năm học</label>
                  <Input
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleChange}
                    placeholder="VD: 2024-2025"
                    className="[&>div]:rounded-2xl [&>div]:bg-slate-50 [&>div]:border-none [&_input]:font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phân loại</label>
                <Select
                  options={[
                    { value: 'THEORY', label: 'Lý thuyết' },
                    { value: 'PRACTICAL', label: 'Thực hành' },
                  ]}
                  value={formData.category}
                  onChange={(val: string) => setFormData(prev => ({ ...prev, category: val as any }))}
                  className="[&>div]:rounded-2xl [&>div]:bg-slate-50 [&>div]:border-none [&_button]:font-bold"
                />
              </div>
            </div>

            {/* Read-only info */}
            <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100 flex items-start gap-4">
              <PiInfoFill className="text-blue-500 shrink-0 mt-0.5" size={20} />
              <div className="space-y-2">
                 <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <p className="text-xs text-slate-600">
                      <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mr-2">NGÀNH:</span>
                      <span className="font-bold text-blue-700">{doc.majors?.name || 'KHÁC'}</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mr-2">LOẠI:</span>
                      <span className="font-bold text-blue-700">{documentTypeLabels[doc.document_type]}</span>
                    </p>
                 </div>
                 <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.1em]">
                    Cập nhật các thông tin trên sẽ hiển thị ngay cho người dùng
                 </p>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                onClick={onClose}
                disabled={loading}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-2xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-200 hover:bg-slate-800"
                disabled={loading}
              >
                {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}

