# 🎯 CareerOS

> One platform for everything in your career journey — track job applications, manage tasks & learning, take smart notes, and get AI assistance that actually understands context.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase)](https://supabase.com)
[![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?logo=google)](https://ai.google.dev)

---

## 🎬 Demo Video

> 📺 **[Watch CareerOS Demo on YouTube →](https://youtube.com/your-link-here)**

---

## 🌐 Live Preview

> **[Live Demo — Click Here](https://career-os-gamma.vercel.app/)**

---

## 📸 Screenshots

### Dashboard

![Dashboard](./screenshot/dashboard.png)

### Job Tracker

![Job Tracker](./screenshot/jobtracker.png)

### Job Detail

![Detail Job](./screenshot/show_job.png)

### Task Manager

![Task Manager](./screenshot/taskManager.png)

### Task Detail

![Detail Task](./screenshot/show_task.png)

### Smart Notes

![Smart Notes](./screenshot/smartNotes.png)

### Create New Note

![New Notes](./screenshot/new_notes.png)

### Note Detail

![Show Notes](./screenshot/show_notes.png)

### AI Career Coach

![AI Career](./screenshot/ai_career.png)

### AI Task Planner

![AI Task](./screenshot/ai_task.png)

---

## 💬 Tagline

> _"CareerOS: The Ultimate Operating System for Your Career Journey."_
>
> _"Stop switching apps. Start building your career."_

---

## 💡 The Problem

I built CareerOS because I personally experienced the frustration:

- I needed a way to track all my job applications in one place — not scattered across browser tabs and notes
- I wanted something like a project manager but for learning — to track how far I've gone in an online course (like Udemy), how many lectures I've finished, and what's next
- I needed a reminder and deadline system so my projects and learning stay on track
- I wanted a notes app — but not just a plain notes app. Something that remembers what I wrote even when I search with different words
- Writing in a notebook doesn't work for me. I needed a digital, searchable, structured place to capture everything important from YouTube videos, online courses, and my own thoughts

## 🔧 The Solution

CareerOS brings all of that into **one integrated platform** with 4 main modules:

**Job Tracker** — Every application, every status update, HRD contact info, salary range, and activity log. All in one place.

**Task Manager** — Not just for coding projects. It has categories (Personal, Learning, Job, Project), priority levels (Low, Medium, High, Urgent), status tracking (Todo → In Progress → Review → Done), deadline + time estimation, and a daily progress log. For learning tasks, you can even log which lecture number you reached each day.

**Smart Notes** — A rich text editor with AI-powered semantic search. Instead of searching by exact keyword, the system understands the _meaning_ of your query and finds relevant notes even if the words don't match exactly. Powered by vector embeddings (pgvector + Gemini).

**AI Tools** — Career Coach for CV review and career advice, Task Planner that generates a day-by-day learning plan, and a daily motivation feature that adapts to your current job application status.

What I'm most proud of: this is a **fully integrated system**. One login, one dashboard, everything connected — exactly like an operating system for your career.

---

## ✨ Key Features

- **Job Tracker** — Track every application from apply to offer, with HRD info, salary range, and activity log
- **Task Manager** — Manage tasks, projects, and courses with checklist, deadline, time estimation, and daily progress log
- **AI Smart Notes** — Rich text editor + semantic search powered by vector embeddings (understands meaning, not just keywords)
- **AI Tools** — Career Coach for CV review, Task Planner for learning roadmaps, and daily motivation powered by Gemini Flash

---

## 🛠 Tech Stack

| Layer     | Technology                                                                          |
| --------- | ----------------------------------------------------------------------------------- |
| Framework | Next.js 15 (App Router)                                                             |
| Language  | TypeScript                                                                          |
| Styling   | Tailwind CSS                                                                        |
| ORM       | Prisma                                                                              |
| Database  | PostgreSQL (Supabase) + pgvector                                                    |
| Auth      | Supabase Auth (`@supabase/ssr`)                                                     |
| AI        | Google Gemini (`gemini-2.0-flash-lite`, `gemini-2.5-flash`, `gemini-embedding-001`) |
| Editor    | TipTap (Rich Text)                                                                  |

---

## 📁 Project Structure

```
career-os/
├── prisma/
│   └── schema.prisma
├── public/
│   └── careeros-logo.jpg
├── screenshot/
│   ├── dashboard.png
│   ├── jobtracker.png
│   ├── show_job.png
│   ├── taskManager.png
│   ├── show_task.png
│   ├── smartNotes.png
│   ├── new_notes.png
│   ├── show_notes.png
│   ├── ai_career.png
│   └── ai_task.png
└── src/
    ├── actions/
    │   ├── job-actions.ts
    │   ├── note-actions.ts
    │   ├── task-actions.ts
    │   └── user-actions.ts
    ├── app/
    │   ├── api/
    │   │   ├── ai/
    │   │   │   ├── coach/
    │   │   │   ├── motivate/
    │   │   │   ├── planner/
    │   │   │   ├── related-notes/
    │   │   │   ├── search-notes/
    │   │   │   └── suggest-tags/
    │   │   ├── jobs/
    │   │   ├── notes/
    │   │   ├── task-attachments/
    │   │   ├── task-tags/
    │   │   ├── tasks/
    │   │   └── upload/
    │   ├── dashboard/
    │   │   ├── ai/
    │   │   │   ├── AiToolsClient.tsx
    │   │   │   └── page.tsx
    │   │   ├── jobs/
    │   │   │   ├── [id]/
    │   │   │   │   ├── JobDetailClient.tsx
    │   │   │   │   └── page.tsx
    │   │   │   ├── JobsClient.tsx
    │   │   │   └── page.tsx
    │   │   ├── notes/
    │   │   │   ├── NotesClient.tsx
    │   │   │   └── page.tsx
    │   │   ├── tasks/
    │   │   │   ├── [id]/
    │   │   │   │   └── page.tsx
    │   │   │   ├── TaskDetail.tsx
    │   │   │   ├── TasksClient.tsx
    │   │   │   └── page.tsx
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── forgot-password/
    │   │   └── page.tsx
    │   ├── login/
    │   │   ├── login.css
    │   │   └── page.tsx
    │   ├── register/
    │   │   ├── page.tsx
    │   │   └── register.css
    │   ├── reset-password/
    │   │   └── page.tsx
    │   ├── terms/
    │   │   └── page.tsx
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── notes/
    │   │   └── RichEditor.tsx
    │   ├── shared/
    │   │   └── Sidebar.tsx
    │   └── ui/
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── index.ts
    │       ├── input.tsx
    │       └── modal.tsx
    ├── lib/
    │   ├── gemini.ts
    │   ├── prisma.ts
    │   ├── supabase-server.ts
    │   ├── supabase.ts
    │   └── vector-search.ts
    └── middleware.ts
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/username/career-os.git
cd career-os
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database (Prisma)
DATABASE_URL=postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Supabase Auth Trigger

Run this SQL in the Supabase SQL Editor to auto-sync new users:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public."User" (id, email, name, "createdAt")
  VALUES (NEW.id::text, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. Run Development Server

```bash
npm run dev
# App runs at http://localhost:3000
```

---

## 🤖 AI Model Strategy

| Model                   | Used For                     | Free Tier Quota |
| ----------------------- | ---------------------------- | --------------- |
| `gemini-2.0-flash-lite` | Daily motivation (primary)   | Large           |
| `gemini-2.5-flash`      | Career Coach & Task Planner  | 20 RPD          |
| `gemini-embedding-001`  | Vector embeddings (768 dims) | 1K RPD          |

---

## 📊 Database Schema

| Model            | Description                                      |
| ---------------- | ------------------------------------------------ |
| `User`           | User data synced from Supabase Auth              |
| `JobApplication` | Job applications with HRD info and salary range  |
| `JobLog`         | Activity log per application                     |
| `Task`           | Tasks with checklist, attachments, and logs      |
| `TaskChecklist`  | Sub-task list per task                           |
| `TaskLog`        | Daily progress log per task                      |
| `Note`           | Notes with vector embeddings for semantic search |

---

## 📄 License

MIT © 2026 CareerOS
