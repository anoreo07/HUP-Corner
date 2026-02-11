-- Migration: Create notifications table
-- Run this in your Supabase database (psql or SQL editor)

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes to speed up reads
CREATE INDEX IF NOT EXISTS idx_notifications_published ON public.notifications(published);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Optional: if you use Row Level Security and want public read access,
-- enable RLS and create a simple policy that allows SELECT for all users:
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public select" ON public.notifications FOR SELECT USING (published = true);
