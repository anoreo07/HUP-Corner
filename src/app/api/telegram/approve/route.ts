import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('documents')
      .update({
        status: 'APPROVED',
        approved_at: new Date().toISOString(),
      } as any)
      .eq('id', documentId)
      .select('*, majors(*)')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Document approved',
      document: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Approval failed' },
      { status: 500 }
    );
  }
}
