-- 003_storage.sql
-- Supabase storage bootstrap for profile images

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-images',
  'profile-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public read of profile images
drop policy if exists "Public read profile images" on storage.objects;
create policy "Public read profile images"
on storage.objects
for select
using (bucket_id = 'profile-images');

-- Authenticated upload/update/delete restricted to own folder prefix {userId}/...
drop policy if exists "Auth upload own profile images" on storage.objects;
create policy "Auth upload own profile images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-images'
  and split_part(name, '/', 1) = (auth.jwt() ->> 'sub')
);

drop policy if exists "Auth update own profile images" on storage.objects;
create policy "Auth update own profile images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-images'
  and split_part(name, '/', 1) = (auth.jwt() ->> 'sub')
)
with check (
  bucket_id = 'profile-images'
  and split_part(name, '/', 1) = (auth.jwt() ->> 'sub')
);

drop policy if exists "Auth delete own profile images" on storage.objects;
create policy "Auth delete own profile images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-images'
  and split_part(name, '/', 1) = (auth.jwt() ->> 'sub')
);
