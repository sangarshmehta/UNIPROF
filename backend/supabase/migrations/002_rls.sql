-- 002_rls.sql
-- Row Level Security policies

alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.bookings enable row level security;
alter table public.notifications enable row level security;

-- Helper role checks based on JWT claim ("role")
create or replace function public.jwt_role()
returns text
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'role')::text, '');
$$;

create or replace function public.jwt_student_id()
returns bigint
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'student_id', '')::bigint;
$$;

create or replace function public.jwt_teacher_id()
returns bigint
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'teacher_id', '')::bigint;
$$;

-- USERS policies
drop policy if exists users_self_read on public.users;
create policy users_self_read on public.users
for select
using (
  id = nullif(auth.jwt() ->> 'sub', '')::bigint
  or public.jwt_role() = 'admin'
);

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users
for update
using (
  id = nullif(auth.jwt() ->> 'sub', '')::bigint
  or public.jwt_role() = 'admin'
)
with check (
  id = nullif(auth.jwt() ->> 'sub', '')::bigint
  or public.jwt_role() = 'admin'
);

-- STUDENTS policies
drop policy if exists students_public_read on public.students;
create policy students_public_read on public.students
for select
using (
  id = public.jwt_student_id()
  or public.jwt_role() in ('teacher', 'admin')
);

drop policy if exists students_self_update on public.students;
create policy students_self_update on public.students
for update
using (
  id = public.jwt_student_id()
  or public.jwt_role() = 'admin'
)
with check (
  id = public.jwt_student_id()
  or public.jwt_role() = 'admin'
);

-- TEACHERS policies
drop policy if exists teachers_read_policy on public.teachers;
create policy teachers_read_policy on public.teachers
for select
using (
  is_approved = true
  or id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
);

drop policy if exists teachers_self_update on public.teachers;
create policy teachers_self_update on public.teachers
for update
using (
  id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
)
with check (
  id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
);

-- BOOKINGS policies
drop policy if exists bookings_scoped_read on public.bookings;
create policy bookings_scoped_read on public.bookings
for select
using (
  student_id = public.jwt_student_id()
  or teacher_id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
);

drop policy if exists bookings_student_insert on public.bookings;
create policy bookings_student_insert on public.bookings
for insert
with check (
  student_id = public.jwt_student_id()
  or public.jwt_role() = 'admin'
);

drop policy if exists bookings_scoped_update on public.bookings;
create policy bookings_scoped_update on public.bookings
for update
using (
  student_id = public.jwt_student_id()
  or teacher_id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
)
with check (
  student_id = public.jwt_student_id()
  or teacher_id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
);

-- NOTIFICATIONS policies
drop policy if exists notifications_own_read on public.notifications;
create policy notifications_own_read on public.notifications
for select
using (
  user_id = nullif(auth.jwt() ->> 'sub', '')::bigint
  or public.jwt_role() = 'admin'
);

drop policy if exists notifications_own_update on public.notifications;
create policy notifications_own_update on public.notifications
for update
using (
  user_id = nullif(auth.jwt() ->> 'sub', '')::bigint
  or public.jwt_role() = 'admin'
)
with check (
  user_id = nullif(auth.jwt() ->> 'sub', '')::bigint
  or public.jwt_role() = 'admin'
);
