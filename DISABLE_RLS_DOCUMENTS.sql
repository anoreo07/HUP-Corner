-- Fix: Disable RLS on documents table so admin can see all documents
-- If RLS is blocking admin from seeing PENDING documents

-- First, check current RLS status
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'documents';

-- If RLS is enabled (rowsecurity = true), disable it:
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'documents';
