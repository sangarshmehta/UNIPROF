# UniProf SaaS Platform

UniProf is a production-grade University Mentorship SaaS ecosystem designed to connect students with academic mentors through a high-performance, visually stunning, and highly secure platform.

## 🚀 Vision
To revolutionize university mentorship by providing a seamless, automated, and professional booking experience that empowers both students and teachers.

## ✨ Premium SaaS Features

### 🎨 Modern UI/UX (Glassmorphism)
- **Stunning Design**: A high-end glassmorphic interface with vibrant gradients and dark mode persistence.
- **Smart Search**: A unified, intelligent search bar that combines Subject, Rating, and Availability filters into a single cohesive UI element.
- **Micro-interactions**: Smooth fade-ins, slide-ups, and hover effects that create a professional, "live" feel.
- **Responsive Layout**: A sticky navbar and drawer-style sidebar optimized for both desktop and mobile productivity.

### 📅 Advanced Scheduling System
- **Weekly Schedule**: Monday to Sunday support with recurring slot logic.
- **Capacity Tracking**: Intelligent slot management with a 10-student capacity limit and real-time "remaining seats" indicators.
- **Mentor Controls**: Teachers can manually publish, edit, or delete slots with immediate synchronization.

### 👨‍🏫 Mentor Management
- **Rich Profiles**: Expanded mentor profiles including Education Level (BTech, MTech, PhD), Specialization tags, and 100+ Language proficiency.
- **Stats Panel**: A real-time dashboard for mentors to track total bookings, pending requests, and average ratings.
- **Booking Panel**: A dedicated interface for mentors to accept or reject student requests with automated student notifications.

### 🎓 Student Ecosystem
- **Wishlist System**: Save and track favorite mentors for quick access.
- **Verified Reviews**: A robust rating system that enforces reviews *only after* a session is marked as completed by the mentor.
- **My Bookings**: A centralized hub to track session history and status (Pending, Accepted, Completed).

## 🛠 Tech Stack
- **Frontend**: React.js with Vanilla CSS (Glassmorphism System).
- **Backend**: Node.js & Express with Supabase Admin SDK.
- **Database**: PostgreSQL (via Supabase) with advanced identity tracking.
- **Auth**: Secure JWT-based RBAC (Role Based Access Control).

## 🏗 Architecture
The platform follows a strict decoupled architecture for maximum scalability:
- **Frontend Services**: Abstracted `apiClient` with specialized services for Teachers, Students, and Bookings.
- **Backend Controllers**: Highly optimized PostgreSQL queries with atomic updates for ratings and capacity.
- **Security**: Enforced CORS, strict schema validation, and SQL-level primary key synchronization.

## 📦 Setup & Installation

### Prerequisites
- Node.js v18+
- A Supabase project (free tier works)

### 1. Clone & Install
```bash
git clone <repo-url>
cd UNIPROF

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment
Copy the example and fill in your Supabase credentials:
```bash
cp backend/.env.example backend/.env
```

Required variables:
| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | A long random string for signing tokens |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (backend only) |
| `CORS_ORIGIN` | Comma-separated allowed origins (see below) |

### 3. CORS Configuration
The backend uses a dynamic CORS allowlist parsed from the `CORS_ORIGIN` environment variable.

```bash
# Development (allow everything)
CORS_ORIGIN=*

# Production (comma-separated, no spaces around commas)
CORS_ORIGIN=https://uniprof.vercel.app,https://uniprof-staging.vercel.app

# Local development with specific port
CORS_ORIGIN=http://localhost:5173
```

**Behavior:**
- `*` → allows all origins (development only)
- Empty + `NODE_ENV=development` → allows all origins
- Empty + `NODE_ENV=production` → blocks all origins (fail-safe)
- Any `*.vercel.app` origin is always allowed (preview deploys)
- All other origins must be explicitly listed

### 4. Run Database Migrations
Execute migrations **in order** in the Supabase SQL Editor:

| Order | File | Purpose |
|-------|------|---------|
| 1 | `001_schema.sql` | Core tables: users, students, teachers, bookings |
| 2 | `002_rls.sql` | Row-level security policies |
| 3 | `003_storage.sql` | Storage buckets for profile images |
| 4 | `004_advanced_scheduling.sql` | Availability table, ratings table, scheduling logic |
| 5 | `005_saas_extensions.sql` | Teacher profile extensions, wishlist table, capacity tracking |

> ⚠️ **All 5 migrations are required.** Skipping `004` or `005` will cause runtime errors in scheduling and wishlist endpoints.

### 5. Start Development Servers
```bash
# Backend (from /backend)
npm run dev    # → http://localhost:5000

# Frontend (from /frontend)
npm run dev    # → http://localhost:5173
```

### 6. Run Tests
```bash
# Backend (from /backend)
npm test

# Frontend (from /frontend)
npm test
```

Set `TEST_SKIP_DB=true` to skip database-dependent tests in CI environments without Supabase credentials.

## 🔒 Production Hardening
- **Automated Validation**: `scripts/check-deploy.js` ensures environment integrity before release.
- **Unit & Integration Testing**: Comprehensive coverage with Vitest and Supertest.
- **System Stability**: Backward compatible migrations and non-breaking structural extensions.

## 📁 Key Directories
```
UNIPROF/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, validation, rate limiting
│   │   ├── validation/    # Zod schemas
│   │   └── config/        # Environment & Supabase setup
│   ├── supabase/migrations/  # Ordered SQL migrations (001–005)
│   └── tests/             # Supertest integration tests
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI (AppShell, TeacherCard, SlotList, etc.)
│   │   ├── pages/         # Route-level pages
│   │   ├── services/      # API client abstraction layer
│   │   └── context/       # React auth context
│   └── __tests__/         # Vitest smoke tests
└── scripts/               # Deployment validation
```

---
**UniProf** — Empowering the next generation of academic mentorship.
