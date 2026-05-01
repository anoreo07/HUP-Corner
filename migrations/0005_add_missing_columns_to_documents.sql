-- Migration: Add missing columns to documents table
-- This migration adds subject_id and count columns that were missing in the initial schema

ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS view_count int4 DEFAULT 0,
ADD COLUMN IF NOT EXISTS download_count int4 DEFAULT 0;

-- Index for subject_id to speed up filtering
CREATE INDEX IF NOT EXISTS idx_documents_subject_id ON public.documents(subject_id);
