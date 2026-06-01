-- Migration: Add category and telegram_bot_index to documents, and add OUTLINE document type
-- File: migrations/0006_add_category_and_bot_index.sql

-- 1. Add category column for THEORY and PRACTICAL documents
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS category text CHECK (category IN ('THEORY', 'PRACTICAL'));

-- 2. Add telegram_bot_index to track which Telegram Bot stored the file (Default to 1)
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS telegram_bot_index int4 DEFAULT 1;

-- 3. Update the document_type check constraint to include 'OUTLINE'
-- Note: In standard PostgreSQL, inline CHECK constraints are automatically named after the table and column.
-- We check and drop the constraint 'documents_document_type_check' if exists, then recreate it.
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_document_type_check;
ALTER TABLE public.documents ADD CONSTRAINT documents_document_type_check CHECK (document_type IN ('EXAM', 'SLIDE', 'TEXTBOOK', 'OTHER', 'OUTLINE'));

-- Create an index on the new category column to speed up queries
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
