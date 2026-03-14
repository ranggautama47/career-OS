# Career OS – Task Manager Architecture

This project implements a modern task manager inspired by Trello and Todo systems.

## Task Structure

A Task can contain:

Task
├ title
├ description
├ category
├ priority
├ status
├ deadline
├ estimatedDays
├ jobApplicationId
├ isGroupProject

Relations:

Task
├ TaskChecklist[]
├ TaskAttachment[]
└ TaskTag[]

## Attachment Flow

1. User uploads file
2. File uploaded to `/api/upload`
3. Upload returns `attachmentUrl`
4. Task created via `createTask()`
5. Attachment saved to database via `/api/task-attachments`

## API

POST /api/tasks  
Create new task

POST /api/upload  
Upload attachment file

POST /api/task-attachments  
Save attachment metadata

## Frontend

Component:

TasksClient.tsx

Main modal:

AddTaskModal()

Features:

- Create task
- Upload attachment
- Add labels
- Add notes
- Link job application
