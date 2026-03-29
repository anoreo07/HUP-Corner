import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    // Authenticate admin
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, published = true, is_featured = false, start_at, end_at } = body || {};

    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const insertObj: any = { title, description: description || null, published, is_featured, created_at: new Date().toISOString() };
    if (start_at) insertObj.start_at = start_at;
    if (end_at) insertObj.end_at = end_at;

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(insertObj)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
