import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const doc = await req.json();

    // Log received data for debugging
    console.log('--- Incoming Upload Request ---');
    console.log(JSON.stringify(doc, null, 2));

    // Validate required fields (including document_type and status)
    if (!doc.title || !doc.file_path || !doc.file_name || !doc.document_type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, file_path, file_name, or document_type' }, 
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Perform insertion
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({
        title: doc.title,
        document_type: doc.document_type,
        major_id: doc.major_id || null,
        subject_id: doc.subject_id || null,
        subject_name: doc.subject_name || null,
        academic_year: doc.academic_year || null,
        lecturer_name: doc.lecturer_name || null,
        faculty: doc.faculty || null,
        description: doc.description || null,
        storage_provider: doc.storage_provider || 'telegram',
        file_path: doc.file_path,
        file_name: doc.file_name,
        file_size: doc.file_size || 0,
        mime_type: doc.mime_type || null,
        uploader_name: doc.uploader_name || null,
        uploader_note: doc.uploader_note || null,
        status: doc.status || 'PENDING',
        view_count: doc.view_count ?? 0,
        download_count: doc.download_count ?? 0,
        // Let database handle created_at via DEFAULT now()
      })
      .select()
      .single();

    if (error) {
      console.error('Database insertion error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { 
          error: error.message, 
          code: error.code, // Postgres error code (e.g., 23503 for foreign key violation)
          details: error.details,
          message: 'Lỗi khi lưu thông tin tài liệu vào cơ sở dữ liệu' 
        }, 
        { status: 500 }
      );
    }

    console.log('Upload record created successfully:', data.id);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Critical API Route Error:', err);
    return NextResponse.json(
      { 
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
      }, 
      { status: 500 }
    );
  }
}