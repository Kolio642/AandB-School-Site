# A&B School Website - Project Structure

This document outlines the architecture and structure of the A&B School Website codebase.

## Directory Structure

```
AandB-School-Site/
├── public/              # Static assets
├── src/                 # Source code
│   ├── app/             # Next.js App Router
│   │   ├── admin/       # Admin dashboard (non-localized)
│   │   ├── api/         # API routes
│   │   ├── [locale]/    # Localized routes (public routes only)
│   │   └── signout/     # Signout functionality
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components
│   │   ├── sections/    # Page sections
│   │   └── ui/          # UI components (from shadcn/ui)
│   ├── context/         # React context providers
│   │   └── auth-context.tsx # Authentication context
│   ├── lib/             # Utility functions and API clients
│   │   ├── admin-helpers.ts  # Admin utility functions
│   │   ├── i18n.ts      # Internationalization utilities
│   │   ├── storage-helpers.ts # Supabase storage helpers
│   │   ├── supabase.ts  # Supabase client and utilities
│   │   └── utils.ts     # General utility functions
│   ├── styles/          # Global styles
│   └── types/           # TypeScript type definitions
├── database/            # Database schema and migrations
├── docs/                # Documentation
│   ├── architecture/    # Project architecture docs
│   ├── deployment/      # Deployment instructions
│   ├── development/     # Development guides
│   └── supabase-storage-guide.md # Storage implementation
├── locales/             # Translation files
│   ├── bg/              # Bulgarian translations
│   └── en/              # English translations
└── supabase/            # Supabase configuration and migrations
```

## Key Components

### Admin Dashboard

The admin dashboard (`/src/app/admin/`) provides content management features:

- News management
- Achievements management 
- Teachers management
- Courses management

### Authentication

Authentication is implemented using Supabase Auth:
- Auth provider in `/src/context/auth-context.tsx`
- Login form handling in admin section
- Protected routes via middleware

### Internationalization

The website supports both Bulgarian and English:
- Language detection and routing in `middleware.ts`
- Translation utilities in `/src/lib/i18n.ts`
- Translation files in `/locales/` directory

### Storage

File storage is handled by Supabase Storage:
- Helper functions in `/src/lib/storage-helpers.ts`
- Storage bucket setup and security policies in Supabase

## Coding Standards

- TypeScript for type safety
- React Server Components for server-rendered content
- Client Components for interactive features
- Tailwind CSS for styling
- Shadcn/ui for component library 