-- 007_migration_repair_and_rls.sql
-- Repair missing Supabase migration metadata table and align RLS
-- for tables introduced after 002_rls.sql.

-- Repair for projects where migration metadata was lost.
create schema if not exists supabase_migrations;

create table if not exists supabase_migrations.schema_migrations (
  version text primary key,
  statements text[],
  name text,
  inserted_at timestamptz default now()
);

-- Enable RLS on newer feature tables.
alter table if exists public.weekly_schedule enable row level security;
alter table if exists public.custom_schedule enable row level security;
alter table if exists public.availability enable row level security;
alter table if exists public.ratings enable row level security;
alter table if exists public.wishlist enable row level security;

-- Availability policies
drop policy if exists availability_scoped_read on public.availability;
create policy availability_scoped_read on public.availability
for select
using (
  teacher_id = public.jwt_teacher_id()
  or public.jwt_role() in ('student', 'admin')
);

drop policy if exists availability_teacher_insert on public.availability;
create policy availability_teacher_insert on public.availability
for insert
with check (
  teacher_id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
);

drop policy if exists availability_teacher_update on public.availability;
create policy availability_teacher_update on public.availability
for update
using (
  teacher_id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
)
with check (
  teacher_id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
);

drop policy if exists availability_teacher_delete on public.availability;
create policy availability_teacher_delete on public.availability
for delete
using (
  teacher_id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
);

-- Weekly/custom schedule policies
drop policy if exists weekly_schedule_scoped_read on public.weekly_schedule;
create policy weekly_schedule_scoped_read on public.weekly_schedule
for select
using (
  teacher_id = public.jwt_teacher_id()
  or public.jwt_role() in ('student', 'admin')
);

drop policy if exists weekly_schedule_teacher_write on public.weekly_schedule;
create policy weekly_schedule_teacher_write on public.weekly_schedule
for all
using (
  teacher_id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
)
with check (
  teacher_id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
);

drop policy if exists custom_schedule_scoped_read on public.custom_schedule;
create policy custom_schedule_scoped_read on public.custom_schedule
for select
using (
  teacher_id = public.jwt_teacher_id()
  or public.jwt_role() in ('student', 'admin')
);

drop policy if exists custom_schedule_teacher_write on public.custom_schedule;
create policy custom_schedule_teacher_write on public.custom_schedule
for all
using (
  teacher_id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
)
with check (
  teacher_id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
);

-- Ratings policies
drop policy if exists ratings_scoped_read on public.ratings;
create policy ratings_scoped_read on public.ratings
for select
using (
  student_id = public.jwt_student_id()
  or teacher_id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
);

drop policy if exists ratings_student_insert on public.ratings;
create policy ratings_student_insert on public.ratings
for insert
with check (
  student_id = public.jwt_student_id()
  or public.jwt_role() = 'admin'
);

-- Wishlist policies
drop policy if exists wishlist_scoped_read on public.wishlist;
create policy wishlist_scoped_read on public.wishlist
for select
using (
  student_id = public.jwt_student_id()
  or public.jwt_role() = 'admin'
);

drop policy if exists wishlist_student_write on public.wishlist;
create policy wishlist_student_write on public.wishlist
for all
using (
  student_id = public.jwt_student_id()
  or public.jwt_role() = 'admin'
)
with check (
  student_id = public.jwt_student_id()
  or public.jwt_role() = 'admin'
);
