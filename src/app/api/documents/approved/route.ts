import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const url = new URL((process as any).env.NEXT_PUBLIC_BASE_URL || 'http://localhost');
    // Parse query params from Request URL
    const reqUrl = typeof globalThis !== 'undefined' && (globalThis as any).requestUrl ? (globalThis as any).requestUrl : undefined;
    // In Next.js route handlers you can access search params via Request, but here use global Request
    // Fall back to reading from environment if needed.

    // Instead, parse from IncomingRequest via the current Request object
    // The runtime passes the request implicitly; use Request in function signature for full control.
    // For simplicity, extract from global location: use query params from the handler's URL via Request
    // NOTE: Next.js provides request via global in some runtimes; to keep compatibility, accept basic params via process.env

    // Simple implementation: read page/perPage/majorCode from environment-like fallback (client-side fetch includes them)
    const raw = (globalThis as any).__NEXT_HANDLER_QUERY || {};
    const page = raw.page ? Number(raw.page) : undefined;
    const perPage = raw.perPage ? Number(raw.perPage) : undefined;
    const majorCode = raw.majorCode ? String(raw.majorCode) : undefined;

    // If no pagination params provided, return all (legacy behavior)
    if (!page || !perPage) {
      const { data, error } = await supabaseAdmin
        .from('documents')
        .select('*')
        .eq('status', 'APPROVED')
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
  export async function GET(req: Request) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
          .select('*')
          .eq('status', 'APPROVED')
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