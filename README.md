# 🎯 CareerOS

> Satu platform untuk semua kebutuhan karier kamu — lacak lamaran, kelola tugas & belajar, catat hal penting, dan dapat bantuan AI yang relevan.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase)](https://supabase.com)
[![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?logo=google)](https://ai.google.dev)

---

## 🎬 Demo Video

> 📺 **[Tonton Demo CareerOS di YouTube →](https://youtube.com/your-link-here)**

---

## 📸 Preview

### Dashboard

![Dashboard](./screenshot/dashboard.png)

### Job Tracker

![Job Tracker](./screenshot/jobtracker.png)

### Detail Lamaran

![Detail Job](./screenshot/show_job.png)

### Task Manager

![Task Manager](./screenshot/taskManager.png)

### Detail Task

![Detail Task](./screenshot/show_task.png)

### Smart Notes

![Smart Notes](./screenshot/smartNotes.png)

### Buat Catatan Baru

![New Notes](./screenshot/new_notes.png)

### Detail Catatan

![Show Notes](./screenshot/show_notes.png)

### AI Career Coach

![AI Career](./screenshot/ai_career.png)

### AI Task Planner

![AI Task](./screenshot/ai_task.png)

---

### problems

- kenapa saya buat ini karena saya ingin mempermudah saya dalam melacak lamaran kerja saya
- saya juga ingin membuat seperti remider dan project manajement contohnya saya buat apps butuh berapa lama sampai apps itu selesai
- saya juga butuh seperti apps yang bisa mencatat perkembangan saya sudah sampai mana belajarnya misal dari course online udemy
- saya juga butuh apps mirip seperti notion untuk mencatat hal hal penting di satu apps
- saya ingin mencatat apa saja hal hal penting yang ada di youtube atau online course supaya saya ingat kalau di buku tulisan saya kurang bagus jadi saya ingin membuat notes tapi yang gak seperti notes biasa

## solving

- jadi saya cari ide dari berbagai sumber youtube ai nah ketemu lah idenya. dan terciptalah web dan apps CareerOS ini nah di sini ada 4 dashboard utama job tracker, task manager, smart notes, dan ai tools
  -selain itu saya juga dapat masukan dan tambahan fitur yang tadi awalnya untuk mencatat lamar kerja dan project management serta notes sekarang mendapatkan upgrade cukup besar dan masuk menjadi product SaaS dan juga dapat membatu karier dan perkembangan diri anda
- karena ada fitur tambahan dari ai bisa membatu review cv dan memberi masukan perbaikanya dan juga ada ai task planner nanti di buatkan plan belajarnya dari day 1 samapai akhir semakin kompleks maka semakin bagus juga plannernya
- di task management juga gak cuma untuk project apps tapi juga ada categorinya seperti personal, learnig, job. ada statusnya todo, inprogress, review, dan done. juga tidak lupa dengan prioritynya seperti low, medium, high, dan urgent.
- dan juga di task ini ada deadline dan estimasinya gitu supaya project atau pun learning kita on track tidak melewati batas waktu yang telah kita tentukan sendiri dan juga terdapat daily progress untuk mencatat perkembangan kita sudah sampai mana baik course atau project kita
- dan juga di bagian learning ada hal paling penting yaitu misal kita beli course itu ada bab atau lecture nah kamu bisa tulis semuanya bab dan masukan semua ke dalam task yang telah anda buat. gak cuma learning sih bisa juga untuk project job buat di taksnya
- yang saya banggakan dari apps ini yaitu satu apps terintegrasi jadi cocok untuk pengembangan karier dan perjalanan carier dan juga seperti nama apps ini career os

## tag line

    "CareerOS: The Ultimate Operating System for Your Career Journey."
    "CareerOS: Berhenti berpindah aplikasi. Mulai fokus bangun karier Anda."

## ✨ Fitur Utama

- **Job Tracker** — Lacak semua lamaran dari apply sampai offer, lengkap dengan info HRD, salary range, dan activity log
- **Task Manager** — Kelola tugas, project, dan course dengan checklist, deadline, estimasi waktu, dan daily progress log
- **AI Smart Notes** — Catatan dengan rich text editor + semantic search berbasis vector embedding (paham makna, bukan cuma keyword)
- **AI Tools** — Career Coach untuk review CV & saran karier, Task Planner untuk breakdown rencana belajar, dan motivasi harian

---

## 🛠 Tech Stack

| Layer     | Teknologi                                                                           |
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

## 📁 Struktur Project

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

## 🚀 Setup & Instalasi

### 1. Clone & Install

```bash
git clone https://github.com/username/career-os.git
cd career-os
npm install
```

### 2. Environment Variables

Buat file `.env` di root:

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

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Setup Supabase Auth Trigger

Jalankan SQL berikut di Supabase SQL Editor:

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

### 5. Jalankan Dev Server

```bash
npm run dev
# App berjalan di http://localhost:3000
```

---

## 🤖 AI Model Strategy

| Model                   | Digunakan untuk              | Kuota Free |
| ----------------------- | ---------------------------- | ---------- |
| `gemini-2.0-flash-lite` | Motivasi harian (primary)    | Besar      |
| `gemini-2.5-flash`      | Career Coach & Task Planner  | 20 RPD     |
| `gemini-embedding-001`  | Vector embeddings (768 dims) | 1K RPD     |

---

## 📊 Database Schema

| Model            | Deskripsi                                             |
| ---------------- | ----------------------------------------------------- |
| `User`           | Data user dari Supabase Auth                          |
| `JobApplication` | Lamaran kerja + info HRD + salary range               |
| `JobLog`         | Activity log per lamaran                              |
| `Task`           | Tugas dengan checklist, attachment, dan logs          |
| `TaskChecklist`  | Sub-task list per task                                |
| `TaskLog`        | Daily progress log per task                           |
| `Note`           | Catatan dengan vector embedding untuk semantic search |

---

## 📄 License

MIT © 2026 CareerOS
