-- Migration: add role column to profiles
-- Run this against your Supabase/Postgres database

BEGIN;

-- Add `role` column to `profiles` table. Default to 'user'.
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

COMMIT;

-- After running this migration, you can mark specific users as admin:
-- UPDATE profiles SET role = 'admin' WHERE email IN ('admin@yourdomain.com');
