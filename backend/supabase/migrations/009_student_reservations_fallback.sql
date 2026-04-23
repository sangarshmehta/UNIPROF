-- 009_student_reservations_fallback.sql
-- Dedicated reservation storage for environments where bookings schema drifts.

create table if not exists public.student_reservations (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.students(id) on delete cascade,
  teacher_id bigint not null references public.teachers(id) on delete cascade,
  student_name text not null default '',
  student_email text not null default '',
  time_slot text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
  reserved_at timestamptz not null default now(),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_student_res_unique_active
  on public.student_reservations(student_id, teacher_id, time_slot)
  where status in ('pending', 'accepted');

create index if not exists idx_student_res_teacher_slot
  on public.student_reservations(teacher_id, time_slot);

alter table if exists public.student_reservations enable row level security;

drop policy if exists student_reservations_scoped_read on public.student_reservations;
create policy student_reservations_scoped_read on public.student_reservations
for select
using (
  student_id = public.jwt_student_id()
  or teacher_id = public.jwt_teacher_id()
  or public.jwt_role() = 'admin'
);

drop policy if exists student_reservations_student_insert on public.student_reservations;
create policy student_reservations_student_insert on public.student_reservations
for insert
with check (
  student_id = public.jwt_student_id()
  or public.jwt_role() = 'admin'
);

drop policy if exists student_reservations_scoped_update on public.student_reservations;
create policy student_reservations_scoped_update on public.student_reservations
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
