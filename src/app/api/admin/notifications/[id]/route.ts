import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('notifications').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    const body = await req.json();
    const { title, description, published, start_at, end_at } = body || {};

    const updateObj: any = {};
    if (title !== undefined) updateObj.title = title;
    if (description !== undefined) updateObj.description = description;
    if (published !== undefined) updateObj.published = published;
    if (start_at !== undefined) updateObj.start_at = start_at;
    if (end_at !== undefined) updateObj.end_at = end_at;

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from('notifications').update(updateObj).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
