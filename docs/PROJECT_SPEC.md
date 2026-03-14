# CareerOS - Project Specification

## 🎯 Product Overview

**CareerOS** is a unified productivity platform specifically designed for students and job hunters. It bridges the gap between academic responsibilities and career progression.

### Core Modules:

1. **Job Application Tracker**: A Kanban-style board to manage the lifecycle of job applications.
2. **Task / Project Manager**: A management system for university assignments and personal projects.
3. **AI Smart Notes**: A knowledge base with rich-text editing and AI-powered Semantic Search.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Shadcn UI
- **Icons**: Lucide React
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **AI/ML**: OpenAI Embeddings API
- **Vector Search**: pgvector (Supabase Extension)

---

## 📂 Folder Structure

```text
/career-os

/prisma
  schema.prisma

/docs
  architecture.md

/src

  /app
    /api
      /jobs
      /tasks
      /notes
      /ai

    /dashboard
    /jobs
    /tasks
    /notes

  /actions
    job-actions.ts
    task-actions.ts
    note-actions.ts

  /components
    /ui
    /shared

  /lib
    prisma.ts
    openai.ts
    vector-search.ts

  /types

nextjs
dashboard/
  jobs/
    page.tsx        ✅ (server)
    JobsClient.tsx  ✅ (client)
  tasks/
    page.tsx        ✅ (server)
    TasksClient.tsx ✅ (client)
  notes/
    page.tsx        ✅ (server)
    NotesClient.tsx ✅ (client)

🗄 Database Schema (Prisma)
Code snippet

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

enum JobStatus { APPLIED INTERVIEW OFFER REJECTED GHOSTED }
enum TaskStatus { TODO DOING REVIEW DONE }
enum Priority { LOW MEDIUM HIGH URGENT }

model User {
  id              String           @id @default(uuid())
  email           String           @unique
  name            String?
  jobApplications JobApplication[]
  tasks           Task[]
  notes           Note[]
  createdAt       DateTime         @default(now())
}

model JobApplication {
  id           String    @id @default(uuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id])
  company      String
  position     String
  platform     String
  link         String?
  status       JobStatus @default(APPLIED)
  appliedDate  DateTime  @default(now())
  followUpDate DateTime?
  notes        String?   @db.Text
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  @@index([userId])
}

model Task {
  id             String     @id @default(uuid())
  userId         String
  user           User       @relation(fields: [userId], references: [id])
  title          String
  description    String?    @db.Text
  status         TaskStatus @default(TODO)
  priority       Priority   @default(MEDIUM)
  deadline       DateTime?
  estimatedDays  Int?
  isGroupProject Boolean    @default(false)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  @@index([userId])
}

model Note {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  content   String   @db.Text
  tags      String[]
  embedding Unsupported("vector(1536)")?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([userId])
}

🧠 AI Integration Logic

    Semantic Search: Every note created will generate an embedding via OpenAI. These embeddings are stored in the Note table using pgvector. Search queries will also be embedded to find the most relevant notes based on cosine similarity.

    AI Follow-Up: Automated email drafting for job applications that haven't responded in >7 days.

    Task Estimation: AI suggests time duration for tasks based on description complexity.
```
