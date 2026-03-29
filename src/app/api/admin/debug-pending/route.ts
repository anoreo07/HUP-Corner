import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';

/**
 * Debug endpoint to check why admin cannot see PENDING documents
 * GET /api/admin/debug-pending
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Try to fetch ALL documents
    const { data: allDocs, error: allError } = await supabaseAdmin
      .from('documents')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching all documents:', allError);
      return NextResponse.json(
        {
          error: 'Failed to fetch documents',
          details: allError.message,
          code: allError.code,
        },
        { status: 500 }
      );
    }

    // Count by status
    const pending = (allDocs || []).filter((d: any) => d.status === 'PENDING');
    const approved = (allDocs || []).filter((d: any) => d.status === 'APPROVED');
    const rejected = (allDocs || []).filter((d: any) => d.status === 'REJECTED');

    console.log('✅ Admin debug info:', {
      totalDocs: allDocs?.length || 0,
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      pendingDocs: pending.map((d: any) => ({ id: d.id, title: d.title })),
    });

    return NextResponse.json({
      success: true,
      total: allDocs?.length || 0,
      statuses: {
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
      },
      pendingDocuments: pending,
      allDocuments: allDocs,
      message: pending.length > 0 
        ? `✅ Found ${pending.length} PENDING documents` 
        : '⚠️ No PENDING documents found',
    });
  } catch (err) {
    console.error('❌ Debug error:', err);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: (err as any).message,
      },
      { status: 500 }
    );
  }
}
