import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';

/**
 * Verify that admin can see PENDING documents
 * GET /api/admin/verify-pending-documents
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get all documents
    const { data: allDocs, error: allError } = await supabaseAdmin
      .from('documents')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false });

    if (allError) {
      return NextResponse.json(
        { error: 'Failed to fetch documents', details: allError.message },
        { status: 500 }
      );
    }

    // Count by status
    const statuses = {
      pending: (allDocs || []).filter((d: any) => d.status === 'PENDING').length,
      approved: (allDocs || []).filter((d: any) => d.status === 'APPROVED').length,
      rejected: (allDocs || []).filter((d: any) => d.status === 'REJECTED').length,
    };

    return NextResponse.json({
      success: true,
      total: allDocs?.length || 0,
      statuses,
      documents: allDocs,
      message: 'Admin can see all documents including PENDING',
    });
  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (err as any).message },
      { status: 500 }
    );
  }
}
