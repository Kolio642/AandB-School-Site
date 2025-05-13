# Admin Dashboard

This document describes the admin dashboard implementation for the A&B School website.

## Overview

The admin dashboard provides a secured interface for school administrators to manage website content including news, achievements, teachers, and courses. It is implemented using Next.js and integrates with Supabase for data storage and authentication.

## Structure

The admin dashboard is located in `/src/app/admin/` and is structured as follows:

```
src/app/admin/
├── dashboard/         # Main dashboard page
├── login/             # Admin login page
├── news/              # News management
│   ├── components/    # News-specific components
│   │   └── news-form.tsx  # Form for creating/editing news
│   ├── [id]/          # Individual news editing
│   └── page.tsx       # News listing and management
├── achievements/      # Achievements management
├── teachers/          # Teachers management
├── courses/           # Courses management
└── layout.tsx         # Admin layout wrapper
```

## Features

### Authentication

- Secure login via Supabase Auth
- Protected routes using middleware
- Session management with automatic refresh
- Secure logout functionality

### News Management

- List all news articles with filtering and search
- Create new news articles with bilingual content
- Edit existing news articles
- Delete news articles
- Toggle published status
- Image upload and management via Supabase Storage

### Achievements Management

- List all achievements with categorization
- Create new achievements with bilingual content
- Edit existing achievements
- Delete achievements
- Toggle published status
- Image upload for achievement certificates and photos

### Teachers Management

- List all teachers
- Add new teacher profiles
- Edit teacher information
- Delete teacher profiles
- Image upload for teacher photos

### Courses Management

- List all courses
- Add new courses with multilingual descriptions
- Edit course details
- Delete courses
- Course category management

## Technology Stack

- **UI Framework**: Next.js App Router
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Data Storage**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Image Storage**: Supabase Storage
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod
- **Type Safety**: TypeScript

## Implementation Details

### Authentication Flow

1. User navigates to `/admin/login`
2. User enters credentials
3. On successful authentication, redirected to `/admin/dashboard`
4. Auth state maintained via Auth Context
5. Protected routes check for valid session

### Data Management

All content is stored in Supabase tables and follows this pattern:

1. **Create**: Form submission with validation → Supabase insert
2. **Read**: Fetch from Supabase with filters → Render in UI
3. **Update**: Form submission with validation → Supabase update
4. **Delete**: Confirmation dialog → Supabase delete

### File Upload

Media files are handled through Supabase Storage:

1. File selected in form
2. On form submission, file uploaded to appropriate Supabase Storage bucket
3. Public URL returned and stored in database
4. Files managed through the storage-helpers.ts utility

## Security Considerations

- Row-Level Security enforced at database level
- Authentication required for all admin actions
- CORS and CSRF protection
- Input validation with Zod schemas
- Secure session handling 