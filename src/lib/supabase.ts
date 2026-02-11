import { supabase } from './supabaseClient';
import type { Major, DocumentWithMajor, Document, DocumentInsert, DocumentType } from '@/types/database';

// re-export client supabase for files that import `{ supabase }` from this module
export { supabase };

export async function getMajors(): Promise<Major[]> {
  const { data, error } = await supabase
    .from('majors')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data || []) as Major[];
}

export async function getApprovedDocuments(majorCode?: string): Promise<DocumentWithMajor[]> {
  // If running on the server, use the admin client directly to bypass RLS.
  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from('documents')
      .select('*, majors(*)')
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false });

    if (majorCode) {
      const { data: major } = await supabaseAdmin
        .from('majors')
        .select('id')
        .eq('code', majorCode)
        .single();

      if (major) {
        query = query.eq('major_id', (major as Major).id);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as DocumentWithMajor[];
  }

  // Client-side: call server API route which uses the admin client
  const url = majorCode ? `/api/documents/approved?majorCode=${encodeURIComponent(majorCode)}` : '/api/documents/approved';
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch approved documents');
  return (await res.json()) as DocumentWithMajor[];
}

export async function getApprovedDocumentsPaginated(
  majorCode?: string,
  page: number = 1,
  perPage: number = 12
): Promise<{ data: DocumentWithMajor[]; count: number; page: number; perPage: number; totalPages: number }> {
  const start = (page - 1) * perPage;
  const end = start + perPage - 1;

  // If running on the server, use the admin client directly to bypass RLS and get exact count.
  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();

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

      if (major) {
        query = query.eq('major_id', (major as Major).id);
      }
    }

    const { data, error, count } = await query;
    if (error) throw error;
    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    return { data: (data || []) as DocumentWithMajor[], count: total, page, perPage, totalPages };
  }

  // Client-side: call server API route which uses the admin client
  const url = majorCode
    ? `/api/documents/approved?majorCode=${encodeURIComponent(majorCode)}&page=${page}&perPage=${perPage}`
    : `/api/documents/approved?page=${page}&perPage=${perPage}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch approved documents');
  return (await res.json()) as { data: DocumentWithMajor[]; count: number; page: number; perPage: number; totalPages: number };
}

export async function getPendingDocuments(): Promise<DocumentWithMajor[]> {
  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*, majors(*)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as DocumentWithMajor[];
  }

  const res = await fetch('/api/documents/pending', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch pending documents');
  return (await res.json()) as DocumentWithMajor[];
}

export async function getAllDocumentsForAdmin(): Promise<DocumentWithMajor[]> {
  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*, majors(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as DocumentWithMajor[];
  }

  // Client-side: use anon supabase client directly. This avoids depending on
  // server-side service role availability for read-only operations (useful
  // when RLS is disabled or anon read access is allowed).
  const { data, error } = await supabase
    .from('documents')
    .select('*, majors(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as DocumentWithMajor[];
}

export async function uploadDocument(doc: DocumentInsert): Promise<Document> {
  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  });

  if (!response.ok) {
    throw new Error('Failed to upload document');
  }

  return response.json();
}

export async function getNotifications(): Promise<import('@/types/database').Notification[]> {
  // Server-side: use admin client to bypass RLS
  if (typeof window === 'undefined') {
    const { getSupabaseAdmin } = await import('./supabaseAdmin');
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return (data || []) as import('@/types/database').Notification[];
  }

  const res = await fetch('/api/notifications', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return (await res.json()) as import('@/types/database').Notification[];
}

export async function approveDocument(id: string): Promise<Document> {
  const response = await fetch(`/api/documents/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error('Failed to approve document');
  }

  return response.json();
}

export async function rejectDocument(id: string): Promise<Document> {
  const response = await fetch(`/api/documents/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error('Failed to reject document');
  }

  return response.json();
}

export async function deleteDocument(id: string): Promise<boolean> {
  const response = await fetch(`/api/documents/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete document');
  }

  return true;
}
