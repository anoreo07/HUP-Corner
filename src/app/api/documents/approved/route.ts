import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const url = new URL(req.url);
    const pageParam = url.searchParams.get('page');
    const perPageParam = url.searchParams.get('perPage');
    const majorCode = url.searchParams.get('majorCode') || undefined;

    const page = pageParam ? Number(pageParam) : undefined;
    const perPage = perPageParam ? Number(perPageParam) : undefined;

    // If no pagination params provided, return all (legacy behavior)
    if (!page || !perPage) {
      const { data, error } = await supabaseAdmin
        .from('documents')
        .select('*, majors(*)')
        .eq('status', 'APPROVED')
        .neq('document_type', 'OUTLINE')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    // If pagination params exist, perform paginated query with count
    const start = (page - 1) * perPage;
    const end = start + perPage - 1;

    let query = supabaseAdmin
      .from('documents')
      .select('*, majors(*)', { count: 'exact' })
      .eq('status', 'APPROVED')
      .neq('document_type', 'OUTLINE')
      .order('created_at', { ascending: false })
      .range(start, end);

    if (majorCode) {
      const { data: major } = await supabaseAdmin
        .from('majors')
        .select('id')
        .eq('code', majorCode)
        .single();

      if (major) query = query.eq('major_id', (major as any).id);
    }

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    return NextResponse.json({ data: data || [], count: total, page, perPage, totalPages });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}