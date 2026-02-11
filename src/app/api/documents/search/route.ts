import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';

      const supabaseAdmin = getSupabaseAdmin();
      const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*, majors(*)')
      .eq('status', 'APPROVED')
      .ilike('title', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
