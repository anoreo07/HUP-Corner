import { z } from 'zod';

const fileSchema = z.instanceof(File);

export const uploadSchema = z.object({
  files: z.array(fileSchema).min(1, 'Vui lòng chọn ít nhất một tệp.'),
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  subject_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  academic_year: z.string().nullable().optional(),
  lecturer_name: z.string().nullable().optional(),
  faculty: z.string().nullable().optional(),
  document_type: z.string().min(1, 'Loại tài liệu là bắt buộc'),
  category: z.string().min(1, 'Danh mục là bắt buộc'),
});
