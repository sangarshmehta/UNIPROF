-- 008_booking_reservations.sql
-- Reservation-focused booking metadata and duplicate protection.

alter table if exists public.bookings
  add column if not exists reserved_at timestamptz not null default now();

alter table if exists public.bookings
  drop constraint if exists bookings_status_check;

alter table if exists public.bookings
  add constraint bookings_status_check
  check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'completed'));

create unique index if not exists idx_bookings_unique_active_reservation
  on public.bookings(student_id, teacher_id, time_slot)
  where status in ('pending', 'accepted');
