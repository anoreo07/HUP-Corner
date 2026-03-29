import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const doc = await req.json();

    // Validate required fields (major_id is optional if user chooses "Khác")
    if (!doc.title || !doc.file_path || !doc.file_name || !doc.file_size) {
      console.error('❌ Upload API: Missing required fields', { doc });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('📤 Upload API: Inserting document:', {
      title: doc.title,
      file_path: doc.file_path,
      file_size: doc.file_size,
      status: 'PENDING',
    });

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({
        title: doc.title,
        document_type: doc.document_type,
        major_id: doc.major_id || null,
        subject_name: doc.subject_name || null,
        academic_year: doc.academic_year || null,
        lecturer_name: doc.lecturer_name || null,
        faculty: doc.faculty || null,
        description: doc.description || null,
        storage_provider: doc.storage_provider,
        file_path: doc.file_path,
        file_name: doc.file_name,
        file_size: doc.file_size,
        mime_type: doc.mime_type || null,
        uploader_name: doc.uploader_name || null,
        uploader_note: doc.uploader_note || null,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Upload API: Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Upload API: Document created:', {
      id: data?.id,
      title: data?.title,
      status: data?.status,
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error('❌ Upload API: Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}