# TrainerOS

TrainerOS is a complete multi-tenant B2B2C SaaS platform designed for Personal Trainers to manage their students, prescribe automated workouts, and allow students to execute them via a mobile-first PWA.

## 🚀 Features

### For Personal Trainers (Web Dashboard)
- **Multi-tenant Architecture:** Secure data isolation per Personal Trainer.
- **Student Management:** Register and assess students (Weight, Height, Goals).
- **Auto-generated Workouts:** A heuristic engine generates training splits and exercises based on the student's BMI, Goal (Hypertrophy, Weight Loss), Fitness Level, and Availability.
- **Workout Editor:** Drag and drop style interface to edit generated workouts before publishing.

### For Students (Mobile-first PWA)
- **Today's Workout:** Instantly see the workout of the day.
- **Execution Mode:** Log sets, reps, and loads effortlessly. 
- **Progress Tracking:** Interactive workout UI tailored for gym environments.

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma v6
- **Styling:** Tailwind CSS v4
- **Auth:** JWT (Jose for Edge support) + bcrypt
- **PWA:** next-pwa

## 🏃‍♂️ Running Locally

1. **Clone and Install:**
```bash
npm install
```

2. **Start Database:**
```bash
docker-compose up -d
```

3. **Setup Environment:**
Copy `.env.example` to `.env` (or configure `DATABASE_URL` pointing to localhost:5433).

4. **Migrate and Seed Database:**
```bash
npx prisma migrate reset --force
npx prisma generate
npx prisma db seed
```
*The seed command will parse `exercises_raw.txt` and populate the DB, automatically classifying exercises by modality, muscle group, and equipment.*

5. **Start Development Server:**
```bash
npm run dev
```

Access the application at `http://localhost:3000`.

## 📦 Project Structure
- `src/app/api`: Edge API routes for Authentication, Generation Engine, and Database interactions.
- `src/app/personal`: The Web Dashboard for Personal Trainers.
- `src/app/student`: The Mobile-first PWA for Students.
- `src/lib/engine`: The heuristic engine that generates workouts automatically.
- `src/lib/auth`: JWT and Middleware edge functions for RBAC.

## 🔒 Security
- **Middleware:** Next.js Middleware intercepts all requests, decoding JWT, verifying active sessions, and redirecting paths based on RBAC (`OWNER_PERSONAL`, `STUDENT`). 
- **Tenant Isolation:** All database actions scope queries by `tenantId`.
