import { createClient } from '@supabase/supabase-js';
import { Major, Document, DocumentWithMajor, DocumentInsert } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client only if credentials are available
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

// Helper functions
export async function getMajors(): Promise<Major[]> {
  const { data, error } = await supabase
    .from('majors')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return (data || []) as Major[];
}

export async function getApprovedDocuments(majorCode?: string): Promise<DocumentWithMajor[]> {
  let query = supabase
    .from('documents')
    .select('*, majors(*)')
    .eq('status', 'APPROVED')
    .order('created_at', { ascending: false });
  
  if (majorCode) {
    const { data: major } = await supabase
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

export async function getPendingDocuments(): Promise<DocumentWithMajor[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*, majors(*)')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as DocumentWithMajor[];
}

export async function getAllDocumentsForAdmin(): Promise<DocumentWithMajor[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*, majors(*)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as DocumentWithMajor[];
}

export async function uploadDocument(doc: DocumentInsert): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .insert(doc as any)
    .select()
    .single();
  
  if (error) throw error;
  return data as Document;
}

export async function approveDocument(id: string): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .update({ status: 'APPROVED' } as any)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Document;
}

export async function rejectDocument(id: string): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .update({ status: 'REJECTED' } as any)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Document;
}

export async function deleteDocument(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

export async function uploadFile(file: File): Promise<{
  path: string;
  name: string;
  size: number;
  mimeType: string;
}> {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `uploads/${timestamp}_${sanitizedName}`;
  
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(path, file);
  
  if (error) throw error;
  return {
    path: data.path,
    name: file.name,
    size: file.size,
    mimeType: file.type,
  };
}

export async function searchDocuments(query: string): Promise<DocumentWithMajor[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*, majors(*)')
    .eq('status', 'APPROVED')
    .ilike('title', `%${query}%`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as DocumentWithMajor[];
}
