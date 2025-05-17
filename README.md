# A&B School Website

A modern, responsive website for A&B School of Mathematics and Informatics in Shumen, Bulgaria.

## About

This website is built for A&B School, providing information about the school's educational programs, achievements, and contact information. The site is fully internationalized with support for both Bulgarian and English languages.

## Features

- **Bilingual Support**: Complete internationalization with Bulgarian and English language options
- **Modern UI**: Sleek, responsive design using TailwindCSS and ShadCN UI components
- **Server Components**: Leverages Next.js App Router and React Server Components
- **OpenStreetMap Integration**: Shows the school location using free, open-source mapping
- **Contact Form**: Easy to use contact form for inquiries
- **Mobile-First Design**: Fully responsive across all device sizes
- **Admin Dashboard**: Secure admin area for managing news and achievements
- **Database Integration**: Supabase backend for storing and retrieving dynamic content
- **File Storage**: Comprehensive file management with Supabase Storage

## Technologies

- **[Next.js](https://nextjs.org/)**: React framework with App Router
- **[React](https://reactjs.org/)**: JavaScript library for building user interfaces
- **[TypeScript](https://www.typescriptlang.org/)**: Typed JavaScript
- **[TailwindCSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[Leaflet.js](https://leafletjs.com/)**: Open-source JavaScript library for mobile-friendly interactive maps
- **[Lucide Icons](https://lucide.dev/)**: Beautiful open-source icons
- **[Supabase](https://supabase.com/)**: Open source Firebase alternative for database, authentication, and storage
- **[React Hook Form](https://react-hook-form.com/)**: Form validation library
- **[Zod](https://zod.dev/)**: TypeScript-first schema validation

## Getting Started

### Prerequisites

- Node.js 18 or later
- pnpm or yarn
- Supabase account (for database functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Kolio642/AandB-School-Site.git
   cd AandB-School-Site
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your Supabase credentials.

4. Set up the database:
   - Create a new project in Supabase
   - Run the SQL setup script from `database/schema.sql` in the Supabase SQL editor
   - Create an admin user in the Supabase Authentication section

5. Set up storage buckets:
   ```bash
   pnpm run create-bucket        # Creates 'teachers' bucket
   pnpm run create-news-bucket   # Creates 'news' bucket
   pnpm run create-achievements-bucket # Creates 'achievements' bucket with folder structure
   ```

6. Run the development server:
   ```bash
   pnpm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
AandB-School-Site/
├── database/            # Database schema and migrations
├── docker/              # Docker configuration files
├── docs/                # Project documentation
│   └── DOCUMENTATION.md # Comprehensive documentation
├── locales/             # Translation files
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── admin/       # Admin dashboard and management
│   │   ├── api/         # API routes
│   │   └── [locale]/    # Localized routes
│   ├── components/      # Reusable UI components
│   │   ├── admin/       # Admin-specific components
│   │   ├── sections/    # Page sections
│   │   └── ui/          # UI components
│   ├── context/         # React context providers
│   ├── data/            # Static data and content
│   ├── lib/             # Utility functions
│   ├── scripts/         # Setup and utility scripts
│   │   ├── create-bucket.js             # Creates teachers bucket
│   │   ├── create-news-bucket.js        # Creates news bucket
│   │   ├── create-achievements-bucket.js # Creates achievements bucket
│   │   └── keep-alive.js                # Script to keep Supabase database alive
│   ├── styles/          # Global styles
│   └── types/           # TypeScript type definitions
├── .env.local.example   # Example environment variables
├── .gitignore
├── middleware.ts        # Next.js middleware for auth
├── next.config.js       # Next.js configuration
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Code Style Guidelines

### File Naming

- Use kebab-case for file names (e.g., `header-component.tsx`)
- Use PascalCase for component files (e.g., `Button.tsx`)
- Use camelCase for utility files (e.g., `formatDate.ts`)

### Component Structure

- Each component should be in its own file
- Component file should export one main component as default
- Helper functions specific to the component should be in the same file
- Shared helper functions should be in the `lib` directory

### TypeScript

- All files should use TypeScript
- Define interfaces and types in component files for component props
- Define shared types in `src/types` directory
- Use explicit typing rather than inferred types for function parameters and returns

### CSS/Styling

- Use Tailwind CSS for styling
- For complex components, consider using composition with smaller components
- Follow a mobile-first approach for responsive design
- Use utility classes for layout and spacing
- Use the `cn()` utility function for conditional class names

## Deployment

The application can be deployed to any hosting provider that supports Next.js applications.

### Building for Production

```bash
pnpm run build
```

### Using Docker

You can also deploy using Docker:

```bash
# From the project root
cd docker
docker-compose up -d
```

For more details on Docker deployment, see the [Docker README](docker/README.md).

## Documentation

Comprehensive documentation is available in the following files:

- **[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)**: Main project documentation covering all aspects of the site
- **[docs/supabase-storage-guide.md](docs/supabase-storage-guide.md)**: Detailed guide on Supabase Storage implementation
- **[docker/README.md](docker/README.md)**: Docker deployment configuration and options

These documentation files cover:
- Technical architecture and technology stack
- Features and functionality
- Database structure and security
- Authentication flow and security
- Internationalization implementation
- Storage and file management
- Development workflow
- Deployment options
- Troubleshooting and maintenance
- Code style guidelines and patterns

## Security

The A&B School website implements several security measures:

- **Authentication**: Secure admin access via Supabase Auth
- **Database Security**: Row-level security policies in Supabase
- **Storage Security**: Access control for uploaded files via Postgres RLS
- **CSRF Protection**: Protection against cross-site request forgery
- **Input Validation**: All user inputs validated with Zod
- **Content Security**: Sanitization of user-generated content
- **Session Management**: Secure HTTP-only cookies and proper session handling

## Testing

The website can be tested using:

```bash
# Run linting
pnpm run lint

# Run type checking
pnpm run type-check

# Start development server for manual testing
pnpm run dev
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenStreetMap for providing free map data
- All the open-source libraries and tools that made this project possible

## Database and Admin Functionality

The A&B School website includes a complete admin dashboard for managing content:

### Features

- **Admin Authentication**: Secure login for administrators
- **News Management**: Create, edit, delete, and publish/unpublish news articles
- **Achievements Management**: Track and showcase student and school achievements
- **File Storage**: Upload and manage images and documents with Supabase Storage
- **Bilingual Content**: All content can be managed in both English and Bulgarian
- **Dynamic Content**: Public-facing pages fetch content from the database
- **Fallback Support**: Static data is used as a fallback for backward compatibility

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the database schema script from `database/schema.sql` in the Supabase SQL editor
3. Set up your environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
4. Create an admin user in Supabase Authentication
5. Set up storage buckets using the provided scripts:
   ```bash
   pnpm run create-bucket
   pnpm run create-news-bucket
   pnpm run create-achievements-bucket
   ```

### Keep Database Alive

To prevent your Supabase database from going to sleep on the free tier, use the keep-alive script:

```bash
pnpm run keep-alive
```

This script will ping your database periodically to keep it active. Alternatively, use GitHub Actions for a more reliable solution - see the `.github/workflows/keep-alive.yml` file.

### Storage Architecture

The website uses a structured approach to file storage:

- **`teachers` bucket**: Stores teacher profile images
- **`news` bucket**: Stores news article images
- **`achievements` bucket**: Stores achievement-related files, organized in folders:
  - `certificates/`: For diplomas and certificates
  - `awards/`: For award images
  - `competitions/`: For competition-related files
  - `academic/`: For academic achievement documents
- **`public1` bucket**: Fallback bucket for general files

For detailed information on the storage implementation, see [docs/supabase-storage-guide.md](docs/supabase-storage-guide.md).

### Seeding the Database

To populate your database with sample data:

1. Install dependencies:
   ```bash
   pnpm install @supabase/supabase-js
   ```

2. Set environment variables for the seed script:
   ```bash
   # Windows
   set SUPABASE_URL=your_supabase_url
   set SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Linux/Mac
   export SUPABASE_URL=your_supabase_url
   export SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the seed script:
   ```bash
   node database/seed.js
   ```

### Accessing the Admin Dashboard

The admin dashboard is available at `/admin`. You'll need to sign in with your Supabase admin credentials.

## Troubleshooting

If you encounter issues during setup or deployment, consult the following resources:

1. Check the troubleshooting sections in [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)
2. For storage issues, refer to [docs/supabase-storage-guide.md](docs/supabase-storage-guide.md)
3. For Docker-related problems, refer to [docker/README.md](docker/README.md)

Common issues and solutions:
- **Database connection problems**: Verify Supabase credentials and network access
- **Authentication issues**: Check browser console for specific error messages
- **Storage issues**: Ensure proper bucket creation and file permissions
- **Build errors**: Ensure all dependencies are installed and compatible 