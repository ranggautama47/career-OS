# CareerOS - System Architecture

## Overview

CareerOS is a fullstack AI-powered productivity platform designed for students and job seekers.  
It combines three core modules into a single dashboard:

1. Job Application Tracker
2. Task / Project Manager
3. AI Smart Notes with Semantic Search

The architecture follows a modern **Next.js fullstack pattern** using Prisma ORM and PostgreSQL with pgvector for AI-powered search.

---

# High Level Architecture

User
↓
Next.js Frontend (App Router)
↓
Server Actions / API Routes
↓
Prisma ORM
↓
PostgreSQL Database (Supabase)
↓
pgvector Extension
↓
OpenAI Embeddings API

---

# System Components

## 1 Frontend Layer

Framework:
Next.js 14 (App Router)

Responsibilities:

- Rendering UI components
- Client-side interactions
- Form submission
- Dashboard visualization

Libraries used:

- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Lucide Icons

---

## 2 Backend Layer

Backend logic is implemented using:

Next.js Server Actions and Route Handlers.

Responsibilities:

- CRUD operations
- Authentication handling
- AI service calls
- Database communication via Prisma

Key backend modules:
/src/actions
/src/app/api

---

## 3 Database Layer

Database:

PostgreSQL (Supabase)

ORM:

Prisma

Tables:

- User
- JobApplication
- Task
- Note

Each table is related via foreign keys.

Example relation:

User
→ many JobApplications  
→ many Tasks  
→ many Notes

---

# Database Design Overview

## User

Stores account information.

Fields:

- id
- email
- name
- createdAt

---

## JobApplication

Tracks job applications.

Fields:

- company
- position
- platform
- status
- appliedDate
- followUpDate

Statuses:

APPLIED  
INTERVIEW  
OFFER  
REJECTED  
GHOSTED

---

## Task

Manages projects and assignments.

Fields:

- title
- description
- status
- priority
- deadline
- estimatedDays

Statuses:

TODO  
DOING  
REVIEW  
DONE

---

## Note

Stores knowledge base notes.

Fields:

- title
- content
- tags
- embedding

Embedding is used for semantic search.

---

# AI Architecture

CareerOS uses AI in three major features.

## 1 Semantic Search (Smart Notes)

Workflow:

User writes note
↓
OpenAI generates embedding
↓
Embedding stored in PostgreSQL using pgvector
↓
User searches notes
↓
Search query converted to embedding
↓
Vector similarity search executed
↓
Most relevant notes returned

Vector similarity uses cosine distance.

---

## 2 AI Follow-Up Email Generator

Workflow:

JobApplication status checked
↓
If no response for 7 days
↓
User clicks "Generate Follow-up"
↓
OpenAI generates professional email

---

## 3 AI Task Estimator

Workflow:

User creates task
↓
Task description sent to AI
↓
AI estimates required time
↓
Suggested estimatedDays returned

---

# Folder Structure Explanation

/career-os
├── prisma
│ └── schema.prisma
│
├── docs
│ └── architecture.md
│
├── src
│ ├── app
│ │ ├── api
│ │ ├── dashboard
│ │ ├── jobs
│ │ ├── tasks
│ │ └── notes
│ │
│ ├── actions
│ │ ├── job-actions.ts
│ │ ├── task-actions.ts
│ │ └── note-actions.ts
│ │
│ ├── components
│ │ ├── ui
│ │ └── shared
│ │
│ ├── hooks
│ │
│ ├── lib
│ │ ├── prisma.ts
│ │ ├── openai.ts
│ │ └── vector-search.ts
│ │
│ └── types

---

# Development Workflow

Recommended development order:

1 Setup Prisma and database connection  
2 Build Job Tracker module  
3 Build Task Manager module  
4 Build Notes module  
5 Implement AI features

---

# Deployment

Deployment platform:

Vercel

Database:

Supabase PostgreSQL

Environment variables:

DATABASE_URL  
OPENAI_API_KEY

---

# AI Collaboration Workflow

This project uses multiple AI assistants:

GPT → product planning and architecture  
Gemini → documentation and refinement  
Claude → code generation

This workflow enables faster vibecoding development.

pw dari supabase: mxazzzaaa11

1️⃣ Jawaban penting dulu

arsitektur itu di schema prisma?

✔ Sebagian besar iya

Karena:

Database Structure = Prisma Schema
Backend Logic = actions/
UI = components / TasksClient

Jadi urutannya:

1️⃣ schema.prisma (paling penting)
2️⃣ actions (create/update/delete)
3️⃣ page.tsx
4️⃣ TasksClient.tsx (UI)

Kalau schema salah → semua layer error.
