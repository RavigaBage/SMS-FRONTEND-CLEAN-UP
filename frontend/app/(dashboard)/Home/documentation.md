# Dashboard Summary – Architecture & Implementation Guide

Modern school management dashboard powered by **Django REST backend** + **Next.js/React frontend** using a **Consolidated Endpoint** pattern for optimal performance.

## Overview

Instead of making multiple API calls from the frontend (students, staff, payments, activities, chart data…), the system uses a **single aggregated endpoint**:

- **Backend**: `DashboardSummary` view → returns one rich JSON payload
- **Frontend**: Single `fetch` → distributes data to multiple React states

This reduces network round-trips, improves perceived performance, and simplifies state management.

**Main benefits**
- One request instead of 4–6
- Efficient database queries with `select_related` & aggregation
- Clean separation of concerns
- Easy caching potential in the future

## Architecture – Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser as Next.js (HomePage)
    participant API as Django API
    participant DB as PostgreSQL

    User->>Browser: Open dashboard
    Browser->>API: GET /api/dashboard-summary/
    API->>DB: Multiple optimized queries
    DB-->>API: Raw data
    API->>Browser: Single JSON response
    Browser->>Browser: Distribute to states (stats, activities, transactions)
    Browser-->>User: Render KPI cards, charts, activity feed, transactions




##  ACADEMIC FOLDER
# Enrollments Management

Module for managing student-class enrollments in the school administration system.

**Frontend**: Next.js (App Router / Client Component)  
**Backend API**: Django REST Framework  
**Main Endpoint**: `/enrollments/`

## Overview

This page allows administrators to:

- View all current student enrollments
- Filter by class
- Search by student name or class
- Add new enrollments via popup form
- Edit existing enrollments
- Delete enrollments
- See highlighted search matches

It follows a **paginated + filterable table** pattern with optimistic UI updates on delete.

## Features

- Real-time filtering by class
- Text search with highlighted matches
- Create / Edit via modal popup (`EnrollPopup`)
- Delete with confirmation
- Loading skeleton during fetch
- Click-outside-to-close action menu
- Status badges with color coding

## Data Structure

### Core Interfaces

```ts
interface UserInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
}

interface Parent {
  id: number;
  user: UserInfo;
  phone_number?: string | null;
  address?: string | null;
}

interface Student {
  id: number;
  user: UserInfo;
  parent: Parent | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  status: string;
}

interface Teacher {
  id: number;
  user: UserInfo;
  first_name: string;
  last_name: string;
  specialization: string;
}

interface ClassData {
  id: number;
  class_name: string;
  teachers: Teacher[];
}

interface EnrollmentData {
  id: number;
  student: Student;
  class_obj: ClassData;
  enrollment_date: string;
  status_display: string;   // e.g. "Active", "Transferred", "Graduated"
}



# Subjects Management

Page for managing academic subjects (create, view, edit, delete).

**Frontend**: Next.js Client Component  
**Backend API**: `/subjects/`

## Overview

- Displays list of subjects with name and code  
- Add new subjects via popup  
- Edit / Delete existing subjects  
- Simple table with action menu per row  
- Loading skeleton during fetch

## Data Structure

```ts
interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
}

interface SubjectApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Subject[];
}




# Classes Management

Page for viewing, creating, editing and deleting academic classes.

**Frontend**: Next.js Client Component  
**Main API Endpoints**:
- `/classes`  
- `/academic-years`  
- `/classes/{id}/` (DELETE)

## Overview

- List all classes with key information  
- Filter by academic year  
- Add new class via popup  
- Edit class details  
- Delete classes (with confirmation)  
- Action menu per row (Edit / Assign Teacher / Delete)

## Data Structures

```ts
interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
}

interface Classroom {
  id: number;
  class_name: string;
  academic_year: string;
  academic_year_name: string;
  room_number?: string;
  class_teacher: Teacher;
  teacher_name?: string;
  subjects: any[];
  capacity: number;
  current_enrollment: number;
  students_on_leave: number;
  grade_level?: string;
  section?: string;
}

interface YearsModel {
  id: number;
  year_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}



# Transcript Home

Main dashboard for viewing student lists and accessing academic transcripts.

**Frontend**: Next.js Client Component  
**Main API Endpoint**: `/enrollments/?class=...&academic_year=...`

## Purpose

- Display students enrolled in a selected class and academic year  
- Show summary statistics (total, active, on-leave)  
- Provide quick access to individual student transcripts  
- Filter by class and academic year

## Data Structures

```ts
type StudentRow = {
  id: number;
  full_name: string;
  student_id: string;
  class_name: string;
  status: "active" | "on_leave";
};

type SummaryRow = {
  total: number;
  active: number;
  on_leave: number;
};

export type StudentResponse = {
  summary: SummaryRow;
  students: {
    id: number;
    full_name: string;
    student_id: string;
    class_name: string;
    status: "active" | "on_leave";
  }[];
 
};

# Students Management

Page for viewing, searching, adding, and managing student records.

**Frontend**: Next.js Client Component  
**Main API Endpoint**: `GET /students/`

## Overview

- Displays list of all students  
- Client-side search by name or ID  
- Add new student via modal  
- Table view with formatted student data  
- Placeholder buttons for Filters & Export

## Data Structure

```ts
// Expected Student type (after formatting)
interface Student {
  id: number | string;
  fullName: string;
  email: string;
  grade: string;
  enrollmentDate: string;
  status: string;
  profileImage: string;
}