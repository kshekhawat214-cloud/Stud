-- ============================================================
-- Stud — Supabase Storage Configuration
-- Claude Sonnet 4.6 — Backend Owner
-- Resume Vault private bucket with per-user RLS
-- Run in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- Create the resume-vault storage bucket (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resume-vault',
  'resume-vault',
  false,           -- private: never publicly accessible without signed URL
  10485760,        -- 10 MB file size limit per resume
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

-- ============================================================
-- Storage RLS Policies for resume-vault bucket
-- Path format enforced: {user_id}/resume-vault/{filename}
-- ============================================================

-- DROP old policies if re-running (idempotent)
drop policy if exists "resume_vault_select" on storage.objects;
drop policy if exists "resume_vault_insert" on storage.objects;
drop policy if exists "resume_vault_update" on storage.objects;
drop policy if exists "resume_vault_delete" on storage.objects;

-- SELECT: authenticated users can only access their own folder
create policy "resume_vault_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'resume-vault'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- INSERT: authenticated users can upload only to their own folder
create policy "resume_vault_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resume-vault'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: authenticated users can update only their own files
create policy "resume_vault_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'resume-vault'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: authenticated users can delete only their own files
create policy "resume_vault_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resume-vault'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
