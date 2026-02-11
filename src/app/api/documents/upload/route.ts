import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const doc = await req.json();

    // Validate required fields
    if (!doc.title || !doc.major_id || !doc.file_path || !doc.file_name || !doc.file_size || !doc.mime_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({
        title: doc.title,
        document_type: doc.document_type,
        major_id: doc.major_id,
        subject_name: doc.subject_name,
        academic_year: doc.academic_year,
        lecturer_name: doc.lecturer_name,
        faculty: doc.faculty,
        description: doc.description,
        storage_provider: doc.storage_provider,
        file_path: doc.file_path,
        file_name: doc.file_name,
        file_size: doc.file_size,
        mime_type: doc.mime_type,
        uploader_name: doc.uploader_name,
        uploader_note: doc.uploader_note,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}