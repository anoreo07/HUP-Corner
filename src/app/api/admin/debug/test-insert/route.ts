import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';

/**
 * Test endpoint to insert a PENDING document
 * GET /api/admin/debug/test-insert
 * 
 * This creates a test PENDING document to verify:
 * 1. Table exists and is writable
 * 2. Status field accepts 'PENDING'
 * 3. Documents appear in admin dashboard
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Create a test document
    const testDoc = {
      title: `🧪 TEST PENDING DOCUMENT - ${new Date().toISOString()}`,
      document_type: 'OTHER',
      major_id: null,
      subject_name: 'TEST',
      academic_year: '2026',
      storage_provider: 'telegram',
      file_path: 'test_file_id_12345',
      file_name: 'test-document.pdf',
      file_size: 1024,
      mime_type: 'application/pdf',
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    console.log('📝 Inserting test document:', testDoc);

    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert([testDoc])
      .select();

    if (error) {
      console.error('❌ Insert error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 500 }
      );
    }

    console.log('✅ Test document inserted:', data);

    return NextResponse.json({
      success: true,
      message: 'Test document created successfully',
      document: data?.[0] || null,
      instructions: [
        '1. Go to admin dashboard',
        '2. Click "Chờ duyệt" tab',
        '3. You should see the test document with 🧪 emoji',
        '4. If you see it, the system is working!',
        '5. If not, check the error details below',
      ],
    });
  } catch (err) {
    console.error('❌ Exception:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        details: (err as any).message,
        stack: (err as any).stack,
      },
      { status: 500 }
    );
  }
}
