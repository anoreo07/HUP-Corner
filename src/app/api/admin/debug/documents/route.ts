import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';

export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Test 1: Check if documents table exists
    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from('documents')
      .select('count', { count: 'exact', head: true });

    // Test 2: Get all documents with status breakdown
    const { data: allDocs, error: allDocsError } = await supabaseAdmin
      .from('documents')
      .select('id, title, status, created_at, file_path, storage_provider')
      .order('created_at', { ascending: false });

    // Test 3: Count by status
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    if (allDocs && Array.isArray(allDocs)) {
      pendingCount = allDocs.filter((d: any) => d.status === 'PENDING').length;
      approvedCount = allDocs.filter((d: any) => d.status === 'APPROVED').length;
      rejectedCount = allDocs.filter((d: any) => d.status === 'REJECTED').length;
    }

    const debugInfo = {
      tableExists: !tableError,
      tableError: tableError?.message || null,
      totalDocuments: allDocs?.length || 0,
      documents: allDocs || [],
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      errors: {
        allDocsError: allDocsError?.message || null,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(debugInfo);
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: (err as any).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
