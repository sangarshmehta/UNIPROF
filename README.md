# UNIPROF Production SaaS

Production-grade full-stack architecture:

- `frontend` -> Vercel (React + Vite)
- `backend` -> Render (Express API)
- `database` -> Supabase (Postgres + Storage + RLS)

## Project structure

```text
UNIPROF/
  frontend/
    src/
      components/
      context/
      pages/
      services/
    .env.example
    package.json
  backend/
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
      validation/
      utils/
      app.js
      index.js
    supabase/
      migrations/
        001_schema.sql
        002_rls.sql
        003_storage.sql
    .env.example
    package.json
```

## Implemented enterprise modules

- Student, Teacher, and Admin RBAC
- Admin dashboard APIs (users, bookings, teacher approval, user delete)
- Unified profile editing for student/teacher with image upload
- Supabase Storage upload endpoint for profile images
- Notification system:
  - booking created -> notify teacher
  - booking accepted -> notify student
- Rate limiting + JWT role protection + input validation
- Strict CORS allow-list handling
- Global frontend loading bar + toast notifications + API error normalization
- Notification bell with unread count and mark-read actions

## Supabase setup

Run migrations in order:

1. `backend/supabase/migrations/001_schema.sql`
2. `backend/supabase/migrations/002_rls.sql`
3. `backend/supabase/migrations/003_storage.sql`

### Seed admin user

Seed at least one admin user in `users` table:

- `role = 'admin'`
- valid `email` and `password_hash`

Admin registration is intentionally disabled from public flows.

## Environment variables

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://your-render-backend.onrender.com
```

### Backend (`backend/.env`)

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-long-random-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGIN=https://your-vercel-project.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=300
AUTH_RATE_LIMIT_MAX_REQUESTS=25
```

## Deploy

### Backend on Render

1. Create a Render Web Service from `backend`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add env vars from `backend/.env`.
5. Deploy and copy backend URL.

### Frontend on Vercel

1. Import project with root directory `frontend`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add `VITE_API_URL` to Vercel project env.
5. Deploy.

## Local run

Backend:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Verification checklist

- Auth and role routing:
  - student -> `/student`
  - teacher -> `/teacher`
  - admin -> `/admin`
- Teacher approval flow works via admin dashboard.
- Profile image upload stores file in `profile-images` bucket and URL persists.
- Notifications update in bell when booking is created/accepted.
- RLS policies are active and prevent cross-user data access.
