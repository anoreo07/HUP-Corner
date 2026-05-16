import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { z } from 'zod';

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  document_type: z.string().min(1, 'Document type is required'),
  major_id: z.string().nullable().optional(),
  subject_id: z.string().nullable().optional(),
  subject_name: z.string().nullable().optional(),
  academic_year: z.string().nullable().optional(),
  lecturer_name: z.string().nullable().optional(),
  faculty: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  storage_provider: z.enum(['telegram', 'local', 's3']).default('telegram'),
  file_path: z.string().min(1, 'File path is required'),
  file_name: z.string().min(1, 'File name is required'),
  file_size: z.number().default(0),
  mime_type: z.string().nullable().optional(),
  uploader_name: z.string().nullable().optional(),
  uploader_note: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
  view_count: z.number().default(0),
  download_count: z.number().default(0),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    
    // Validate input using Zod
    const result = uploadSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: result.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      );
    }

    const doc = result.data;
    const supabaseAdmin = getSupabaseAdmin();
    
    // Perform insertion
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({
        ...doc,
        // Let database handle created_at via DEFAULT now()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { 
          error: error.message, 
          code: error.code,
          details: error.details,
          message: 'Lỗi khi lưu thông tin tài liệu vào cơ sở dữ liệu' 
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { 
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
      }, 
      { status: 500 }
    );
  }
}