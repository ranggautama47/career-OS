# Career OS – Task System Architecture

This project implements a modern task manager similar to Trello and Todo applications.

## Core Entity

Task

A task represents a unit of work in the system.

Fields:

- title
- description
- status
- priority
- category
- deadline
- estimatedDays
- jobApplicationId (optional)
- isGroupProject

Relations:

Task
├ TaskChecklist[]
├ TaskAttachment[]
└ TaskTag[]

---

## Database Models

TaskChecklist

Represents subtasks inside a task.

Fields:

- taskId
- title
- done
- order

---

TaskAttachment

Stores uploaded files related to a task.

Fields:

- taskId
- url
- name
- createdAt

---

TaskTag

Stores labels assigned to a task.

Fields:

- taskId
- label
- color

---

## API Endpoints

POST /api/tasks
Creates a new task.

POST /api/upload
Uploads a file and returns a URL.

POST /api/task-attachments
Stores attachment metadata in database.

---

## Frontend Component

TasksClient.tsx

Main modal component:

AddTaskModal()

Features:

- create task
- link job application
- upload attachment
- add labels
- add notes
- assign priority
- assign category
- set deadline

---

## Attachment Flow

1. User selects a file
2. File uploaded via `/api/upload`
3. Server returns `attachmentUrl`
4. Task is created
5. Attachment saved via `/api/task-attachments`

---

## Goal

Build a career productivity system combining:

- task manager
- job tracker
- AI assistant
- resume analyzer
- learning planner
