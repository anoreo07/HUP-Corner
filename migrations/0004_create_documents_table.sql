-- Migration: Create documents table with proper schema
-- This table stores document metadata with approval workflow

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('EXAM', 'SLIDE', 'TEXTBOOK', 'OTHER')),
  major_id uuid REFERENCES public.majors(id) ON DELETE SET NULL,
  subject_name text,
  academic_year text,
  lecturer_name text,
  faculty text,
  description text,
  storage_provider text NOT NULL CHECK (storage_provider IN ('supabase', 'r2', 'cloudinary', 'local', 'telegram')),
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  uploader_name text,
  uploader_note text,
  admin_note text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes to speed up queries
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_major_id ON public.documents(major_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_storage_provider ON public.documents(storage_provider);

-- Row Level Security (optional - set up policies as needed)
-- ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to see all documents
-- CREATE POLICY "Admins can see all documents" ON public.documents
--   FOR SELECT
--   USING (auth.jwt() -> 'role' = '"admin"');

-- Policy: Allow users to see only APPROVED documents
-- CREATE POLICY "Users can see approved documents" ON public.documents
--   FOR SELECT
--   USING (status = 'APPROVED' OR auth.uid() = uploader_id);

-- Policy: Allow anyone to insert (upload)
-- CREATE POLICY "Anyone can insert documents" ON public.documents
--   FOR INSERT
--   WITH CHECK (true);
