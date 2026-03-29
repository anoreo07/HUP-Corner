-- Migration: Check if documents table has data
-- This query will help verify if documents are being saved properly

-- Query 1: Count all documents by status
SELECT 
  status,
  COUNT(*) as count
FROM public.documents
GROUP BY status;

-- Query 2: Show 10 most recent documents
SELECT 
  id,
  title,
  status,
  storage_provider,
  created_at
FROM public.documents
ORDER BY created_at DESC
LIMIT 10;

-- Query 3: Count total documents
SELECT COUNT(*) as total_documents FROM public.documents;

-- If no documents found, check if documents table exists:
-- SELECT * FROM information_schema.tables 
-- WHERE table_schema = 'public' 
--   AND table_name = 'documents';
