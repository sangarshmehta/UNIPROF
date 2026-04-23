-- 004_advanced_scheduling.sql
-- Advanced scheduling tables for UNIPROF.
-- Uses bigint PKs/FKs to stay consistent with 001_schema.sql.
-- NOTE: bookings and notifications are already defined in 001_schema.sql;
--       this file only adds the brand-new scheduling tables + ratings.

-- TABLE: weekly_schedule
-- Stores a teacher's recurring availability per weekday.
CREATE TABLE IF NOT EXISTS public.weekly_schedule (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    teacher_id  bigint NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    day_of_week int    NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time  time   NOT NULL,
    end_time    time   NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- TABLE: custom_schedule
-- Overrides/extras for a specific calendar date.
CREATE TABLE IF NOT EXISTS public.custom_schedule (
    id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    teacher_id    bigint NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    schedule_date date   NOT NULL,
    start_time    time   NOT NULL,
    end_time      time   NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now()
);

-- TABLE: availability
-- Explicit time-slot entries a teacher publishes for booking.
-- time_slot stored as text (e.g. "Mon 10:00–11:00") to match
-- the existing teachers.availability text[] convention.
CREATE TABLE IF NOT EXISTS public.availability (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    teacher_id bigint  NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    time_slot  text    NOT NULL,
    max_slots  int     NOT NULL DEFAULT 10 CHECK (max_slots > 0),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- TABLE: ratings
-- Per-student rating of a teacher (1–5 stars).
CREATE TABLE IF NOT EXISTS public.ratings (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id bigint NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id bigint NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    rating     int    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weekly_schedule_teacher
    ON public.weekly_schedule(teacher_id);

CREATE INDEX IF NOT EXISTS idx_custom_schedule_teacher_date
    ON public.custom_schedule(teacher_id, schedule_date);

CREATE INDEX IF NOT EXISTS idx_availability_teacher_slot
    ON public.availability(teacher_id, time_slot);

CREATE INDEX IF NOT EXISTS idx_ratings_teacher
    ON public.ratings(teacher_id);

CREATE INDEX IF NOT EXISTS idx_ratings_student
    ON public.ratings(student_id);

