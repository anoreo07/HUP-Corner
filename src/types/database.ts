// Database types matching Supabase schema

export type DocumentType = 'EXAM' | 'SLIDE' | 'TEXTBOOK' | 'OTHER';
export type StorageProvider = 'supabase' | 'r2' | 'cloudinary' | 'local' | 'telegram';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Major {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  document_type: DocumentType;
  major_id: string | null;
  subject_name: string | null;
  academic_year: string | null;
  storage_provider: StorageProvider;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  status: DocumentStatus;
  created_at: string;
}

export interface DocumentWithMajor extends Document {
  majors?: Major | null;
}

export interface DocumentInsert {
  title: string;
  document_type: DocumentType;
  major_id?: string | null;
  subject_name?: string | null;
  academic_year?: string | null;
  storage_provider: StorageProvider;
  file_path: string;
  file_name: string;
  file_size?: number | null;
  mime_type?: string | null;
}

export interface Notification {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  created_at: string;
}

