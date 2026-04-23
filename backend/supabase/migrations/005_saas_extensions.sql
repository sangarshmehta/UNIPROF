-- 005_saas_extensions.sql
-- Extensions for UniProf Production SaaS features.

-- 1. Extend teachers table with educational and proficiency details.
ALTER TABLE public.teachers
  ADD COLUMN IF NOT EXISTS education_level text CHECK (education_level IN ('BE / BTech', 'ME / MTech', 'PhD')),
  ADD COLUMN IF NOT EXISTS specialization text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}';

-- 2. Add booked_count to availability for capacity tracking.
ALTER TABLE public.availability
  ADD COLUMN IF NOT EXISTS booked_count int DEFAULT 0 CHECK (booked_count >= 0);

-- 3. Update ratings to include booking reference and review text.
ALTER TABLE public.ratings
  ADD COLUMN IF NOT EXISTS booking_id bigint REFERENCES public.bookings(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS review text DEFAULT '';

-- 4. Create Wishlist table.
CREATE TABLE IF NOT EXISTS public.wishlist (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id bigint NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id bigint NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(student_id, teacher_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_student ON public.wishlist(student_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_teacher ON public.wishlist(teacher_id);
CREATE INDEX IF NOT EXISTS idx_ratings_booking ON public.ratings(booking_id);
