-- 001_schema.sql
-- Core production schema for UNIPROF SaaS

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id bigint generated always as identity primary key,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('student', 'teacher', 'admin')),
  name text not null default '',
  gender text not null default '' check (gender in ('Male', 'Female', 'Other', '')),
  student_id bigint unique,
  teacher_id bigint unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id bigint generated always as identity primary key,
  user_id bigint unique,
  name text not null default '',
  email text not null unique,
  gender text not null default '' check (gender in ('Male', 'Female', 'Other', '')),
  phone_number text not null default '',
  profile_image text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id bigint generated always as identity primary key,
  user_id bigint unique,
  name text not null default '',
  email text not null unique,
  gender text not null default '' check (gender in ('Male', 'Female', 'Other', '')),
  department text not null default '',
  subjects text[] not null default '{}',
  room_number text not null default '',
  bio text not null default '',
  profile_image text not null default '',
  availability text[] not null default '{}',
  rating numeric(2,1) not null default 0.0 check (rating >= 0 and rating <= 5),
  total_reviews integer not null default 0 check (total_reviews >= 0),
  is_approved boolean not null default false,
  approved_at timestamptz,
  approved_by bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  student_id bigint not null,
  teacher_id bigint not null,
  student_name text not null,
  student_email text not null,
  time_slot text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id bigint not null,
  type text not null check (type in ('booking_created', 'booking_accepted', 'booking_rejected', 'system')),
  title text not null,
  message text not null default '',
  entity_type text not null default '',
  entity_id bigint,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.students
  add constraint students_user_id_fkey foreign key (user_id) references public.users(id) on delete set null;

alter table public.teachers
  add constraint teachers_user_id_fkey foreign key (user_id) references public.users(id) on delete set null;

alter table public.bookings
  add constraint bookings_student_id_fkey foreign key (student_id) references public.students(id) on delete cascade;

alter table public.bookings
  add constraint bookings_teacher_id_fkey foreign key (teacher_id) references public.teachers(id) on delete cascade;

alter table public.notifications
  add constraint notifications_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;

alter table public.teachers
  add constraint teachers_approved_by_fkey foreign key (approved_by) references public.users(id) on delete set null;

alter table public.users
  add constraint users_student_id_fkey foreign key (student_id) references public.students(id) on delete set null;

alter table public.users
  add constraint users_teacher_id_fkey foreign key (teacher_id) references public.teachers(id) on delete set null;

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_active on public.users(is_active);
create index if not exists idx_students_email on public.students(email);
create index if not exists idx_teachers_email on public.teachers(email);
create index if not exists idx_teachers_approved on public.teachers(is_approved);
create index if not exists idx_bookings_teacher_status on public.bookings(teacher_id, status);
create index if not exists idx_bookings_student_status on public.bookings(student_id, status);
create index if not exists idx_bookings_teacher_slot on public.bookings(teacher_id, time_slot);
create index if not exists idx_notifications_user_read on public.notifications(user_id, is_read, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists trg_teachers_updated_at on public.teachers;
create trigger trg_teachers_updated_at
before update on public.teachers
for each row execute function public.set_updated_at();

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();
