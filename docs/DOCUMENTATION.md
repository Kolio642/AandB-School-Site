# A&B School Website Documentation

## Overview

The A&B School Website is a modern, responsive web application built for A&B School of Mathematics and Informatics in Shumen, Bulgaria. The site serves as the school's digital presence, providing information about educational programs, student achievements, news, and contact information. It features comprehensive bilingual support for both Bulgarian and English languages.

## Technical Architecture

### Technology Stack

- **Frontend Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS with ShadCN UI components
- **State Management**: React Context API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps Integration**: OpenStreetMap with Leaflet.js
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: Custom i18n implementation

### Project Structure

```
AandB-School-Site/
├── src/
│   ├── app/             # Next.js App Router pages and layouts
│   │   ├── [locale]/    # Internationalized routes for public pages
│   │   ├── admin/       # Admin dashboard (non-localized)
│   │   └── api/         # API routes
│   ├── components/      # Reusable UI components
│   │   ├── admin/       # Admin-specific components
│   │   ├── layout/      # Layout components (header, footer)
│   │   ├── sections/    # Page section components
│   │   └── ui/          # UI components from ShadCN
│   ├── context/         # React context providers
│   ├── data/            # Static data and content
│   ├── lib/             # Utility functions and clients
│   ├── styles/          # Global styles
│   └── types/           # TypeScript type definitions
├── database/            # Database schema and migrations
├── locales/             # Translation files
│   ├── bg/              # Bulgarian translations
│   └── en/              # English translations
├── public/              # Static assets
└── supabase/            # Supabase configuration
```

## Key Features

### 1. Multilingual Support

The website offers full internationalization in Bulgarian and English, implemented through:

- **Route-based Localization**: URLs include locale prefixes (`/en/about`, `/bg/about`)
- **Translation Files**: JSON files in the `locales` directory for each language
- **Default Locale**: Bulgarian (`bg`) is set as the default language
- **Language Switching**: Users can toggle between languages via the language selector in the header

### 2. Responsive Design

The website is built with a mobile-first approach, ensuring proper display across all device sizes:

- **Mobile**: Optimized for small screens with appropriate navigation
- **Tablet**: Responsive layout for medium-sized screens
- **Desktop**: Full-featured experience for larger screens
- **Image Optimization**: Next.js Image component for responsive images

### 3. Content Management

The website includes a comprehensive admin dashboard for managing content:

- **News Management**: Add, edit, delete, and publish news articles
- **Achievements Management**: Track and showcase student and school achievements
- **Bilingual Content Editing**: Interface for managing content in both languages

### 4. User Authentication

Secure admin authentication is implemented using Supabase Auth:

- **Admin Login**: Secure login page for administrators
- **Session Management**: Proper session handling and protection
- **Protected Routes**: Admin routes are protected by middleware

## Page Descriptions

### Public Pages

1. **Home Page** (`/` or `/[locale]`)
   - Hero banner with key messaging
   - Feature highlights of the school
   - Testimonials from students and parents
   - Latest news section
   - Call to action

2. **About Page** (`/[locale]/about`)
   - School history and mission
   - Teaching methodology
   - Faculty information

3. **Education Page** (`/[locale]/education`)
   - Programs and courses offered
   - Curriculum information
   - Educational approach

4. **News Page** (`/[locale]/news`)
   - List of all news articles
   - Individual news article pages

5. **Achievements Page** (`/[locale]/achievements`)
   - Student and school accomplishments
   - Awards and recognitions

6. **Contact Page** (`/[locale]/contacts`)
   - Contact form
   - School location map
   - Contact information

### Admin Pages

1. **Admin Login** (`/admin/login`)
   - Authentication form for administrators

2. **Admin Dashboard** (`/admin/dashboard`)
   - Overview of site content
   - Quick statistics

3. **News Management** (`/admin/news`)
   - List, create, edit, and delete news articles

4. **Achievements Management** (`/admin/achievements`)
   - List, create, edit, and delete achievements

## Database Structure

The application uses Supabase (PostgreSQL) as its database with the following main tables:

1. **News Table**
   - `id`: UUID (primary key)
   - `created_at`: Timestamp
   - `updated_at`: Timestamp
   - `title_en`: Text (English title)
   - `title_bg`: Text (Bulgarian title)
   - `summary_en`: Text (English summary)
   - `summary_bg`: Text (Bulgarian summary)
   - `content_en`: Text (English content)
   - `content_bg`: Text (Bulgarian content)
   - `date`: Date
   - `image`: Text (image URL)
   - `published`: Boolean

2. **Achievements Table**
   - `id`: UUID (primary key)
   - `created_at`: Timestamp
   - `updated_at`: Timestamp
   - `title_en`: Text (English title)
   - `title_bg`: Text (Bulgarian title)
   - `description_en`: Text (English description)
   - `description_bg`: Text (Bulgarian description)
   - `date`: Date
   - `image`: Text (image URL)
   - `student_name`: Text
   - `category`: Text
   - `published`: Boolean

### Database Indexes and Performance

The database uses several indexes to optimize query performance:

- `news_date_idx`: Index on news publication date for efficient sorting
- `news_published_idx`: Index on published flag for filtering
- `achievements_date_idx`: Index on achievement date for efficient sorting
- `achievements_category_idx`: Index on category for filtering
- `achievements_published_idx`: Index on published flag for filtering

### Row-Level Security Policies

Supabase's Row-Level Security (RLS) is configured with the following policies:

1. **News Table**:
   - Public users can only read published news
   - Authenticated users (admins) can read, create, update, and delete all news items

2. **Achievements Table**:
   - Public users can only read published achievements
   - Authenticated users (admins) can read, create, update, and delete all achievements

## Authentication Flow

The authentication system is built on Supabase Auth and follows this flow:

1. **Login Initiation**:
   - User navigates to `/admin/login`
   - Login form rendered with email/password fields

2. **Authentication**:
   - Credentials submitted to Supabase Auth
   - On success, session established and stored
   - Success marker cookie set to prevent redirect loops

3. **Session Management**:
   - Auth state managed through React Context
   - Auth context checks session status on app load
   - Session refreshed automatically when needed

4. **Route Protection**:
   - Middleware intercepts requests to admin routes
   - Checks for valid session
   - Redirects to login page if no session found

5. **Logout**:
   - User initiates logout
   - Session destroyed on Supabase
   - Redirect to login page

## Internationalization Implementation

The website uses a custom internationalization solution:

1. **Route Structure**:
   - Locale included in the route for public pages: `/[locale]/page`
   - Admin routes are non-localized at `/admin/*` for simplicity
   - Static export supports all locales for public routes

2. **Translation Access**:
   - Translations stored in JSON files
   - Accessed via the `getTranslations` helper function

3. **Language Detection**:
   - Default language is Bulgarian (`bg`)
   - Language detected from URL path
   - Fallback to default if no locale specified

4. **Language Switching**:
   - Language selector updates URL path
   - Page reloads with new locale

## Component Usage Guide

### Layout Components

- **Header**: Main navigation and language selector
- **Footer**: Site links, social media, and copyright
- **Container**: Wrapper for content width and padding

### UI Components

- **Button**: Primary, secondary, outline, ghost variants
- **Input**: Text input fields with validation
- **Textarea**: Multi-line text input
- **Select**: Dropdown selectors
- **Switch**: Toggle controls
- **Tabs**: Content organization with tabs

### Section Components

- **HeroSection**: Main banner for pages
- **FeaturesSection**: Highlight school features
- **TestimonialsSection**: Student and parent quotes
- **NewsSection**: Latest news preview
- **CTASection**: Call to action

### Admin Components

- **LoginForm**: Authentication form
- **DashboardLayout**: Admin area wrapper with navigation
- **NewsForm**: Form for creating/editing news
- **AchievementForm**: Form for creating/editing achievements

## Development Workflow

### Environment Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Configure environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Update with your Supabase credentials

### Local Development

- Run development server: `pnpm run dev`
- Access site at: `http://localhost:3000`

### Database Setup

1. Create a Supabase project
2. Run the SQL setup script from `database/schema.sql`
3. Create admin users in Supabase Authentication

### Building for Production

- Create production build: `pnpm run build`
- Test production build: `pnpm run start`

## Deployment

The website can be deployed through various methods:

### Standard Deployment

Deploy as a Node.js application on platforms like Vercel or Netlify:

```
pnpm run build
pnpm run start
```

### Static Export

For static hosting environments:

```
pnpm run build
```

The output will be in the `out` directory.

### Docker Deployment

1. Use the provided Docker configuration
2. Build and run the Docker container

```
cd docker
docker-compose up -d
```

For production deployment without the local Supabase instance:

```
cd docker
docker-compose up -d nextjs
```

## Security Considerations

- **Authentication**: Secure admin access with Supabase Auth with appropriate password policies
- **Database Security**: Row-level security policies in Supabase limit data access based on authentication status
- **CORS**: Proper cross-origin resource sharing configuration to prevent unauthorized API access
- **Input Validation**: All user inputs validated with Zod to prevent injection attacks
- **Content Security**: Sanitization of user-generated content before display
- **API Protection**: API routes protected with authentication checks
- **Environment Variables**: Sensitive credentials stored in environment variables, not in code
- **Docker Security**: Containers run with least privilege necessary
- **HTTPS**: All production deployments should use HTTPS to encrypt data in transit
- **Session Management**: HTTP-only cookies for session tokens to prevent client-side access

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: 
   - Ensure all required variables are set in `.env.local`
   - Check for typos in environment variable names
   - Verify Supabase credentials are correct

2. **Database Connection**: 
   - Check Supabase credentials and network access
   - Verify IP restrictions in Supabase dashboard
   - Test connection with a simple query

3. **Image Upload Failures**: 
   - Verify Supabase storage configuration
   - Check storage bucket permissions
   - Ensure file size is within limits (max 2MB recommended)

4. **Build Errors**: 
   - Ensure all dependencies are installed and compatible
   - Check for TypeScript errors with `pnpm run type-check`
   - Verify Node.js version matches `.nvmrc` (use nvm if available)

5. **Authentication Issues**:
   - Clear browser cookies and try again
   - Check browser console for specific error messages
   - Verify user exists in Supabase Authentication dashboard

6. **Docker Deployment Problems**:
   - Check Docker logs: `docker-compose logs`
   - Ensure ports are not already in use
   - Verify Docker environment variables are properly set

### Debugging Tools

1. **Browser Developer Tools**: Use Network tab to inspect API requests
2. **Supabase Dashboard**: Check authentication logs and database queries
3. **Local Logging**: Review console logs in development environment

### Support Resources

- **Documentation**: Refer to this document and code comments
- **Issue Tracker**: Report bugs on the project's issue tracker
- **Contact**: Reach out to the development team for further assistance

## Maintenance

### Regular Tasks

- **Content Updates**: Regularly add news and achievements
- **Security Updates**: Keep dependencies updated
- **Database Backups**: Schedule regular Supabase backups
- **Performance Monitoring**: Track page loading times and optimize as needed

### Update Process

1. Pull latest code changes
2. Install any new dependencies
3. Apply database migrations if necessary
4. Test thoroughly before deploying to production 