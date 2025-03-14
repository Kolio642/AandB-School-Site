# Docker Setup for A&B School Website

This guide provides instructions for setting up a Docker environment for local development of the A&B School website with Supabase integration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Docker Configuration Files](#docker-configuration-files)
4. [Running the Development Environment](#running-the-development-environment)
5. [Working with Supabase Locally](#working-with-supabase-locally)
6. [Common Tasks and Commands](#common-tasks-and-commands)
7. [Production Considerations](#production-considerations)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)
- [Node.js](https://nodejs.org/) (for local development outside Docker)
- [Git](https://git-scm.com/)

## Project Structure

The Docker setup will create the following structure:

```
aandb-school-site/
├── .env.local                # Environment variables for local development
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Next.js application Dockerfile
├── supabase/                 # Supabase configuration
│   ├── migrations/           # SQL migrations for database setup
│   │   ├── 01_schema.sql     # Initial schema creation
│   │   └── 02_seed.sql       # (Optional) Seed data for development
│   └── config.toml           # Supabase configuration
└── ... (existing project files)
```

## Docker Configuration Files

### 1. Docker Compose Configuration

Create a `docker-compose.yml` file in your project root:

```yaml
version: '3.8'

services:
  # Next.js application
  nextjs:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    depends_on:
      - supabase
    networks:
      - aandb-network

  # Supabase local development
  supabase:
    image: supabase/supabase-local:latest
    ports:
      - "54321:54321"  # API and Studio
      - "54322:54322"  # Inbucket (for email testing)
    volumes:
      - ./supabase/migrations:/supabase/migrations
      - ./supabase/config.toml:/supabase/config.toml
      - supabase-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=postgres
      - JWT_SECRET=${JWT_SECRET}
      - ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    networks:
      - aandb-network

networks:
  aandb-network:
    driver: bridge

volumes:
  supabase-data:
```

### 2. Next.js Dockerfile

Create a `Dockerfile` in your project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app will run on
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]
```

### 3. Supabase Configuration

Create a `supabase/config.toml` file:

```toml
# A string used to distinguish different Supabase projects on the same host. Defaults to the working
# directory name when running `supabase init`.
project_id = "aandb-school-site"

[api]
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. public and storage are always included.
schemas = ["public", "storage", "extensions"]
# Extra schemas to add to the search_path of every request. public is always included.
extra_search_path = ["extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[db]
# Port to use for the local database URL.
port = 5432
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 15

[studio]
# Port to use for Supabase Studio.
port = 54321

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
# Port to use for the email testing server web interface.
port = 54322

[storage]
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

[auth]
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://localhost:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://localhost:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 seconds (1
# week).
jwt_expiry = 3600
# Allow/disallow new user signups to your project.
enable_signup = true

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin`, `notion`, `twitch`,
# `twitter`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
secret = ""
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""
```

### 4. Supabase Migrations

Create a `supabase/migrations/01_schema.sql` file with the database schema:

```sql
-- Create schema for news and achievements
BEGIN;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- News table
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en VARCHAR(255) NOT NULL,
  title_bg VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content_en TEXT NOT NULL,
  content_bg TEXT NOT NULL,
  image_url VARCHAR(255),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT false
);

-- Create index for faster queries
CREATE INDEX idx_news_published_at ON news(published_at);

-- Enable row-level security
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read published news" 
  ON news FOR SELECT 
  USING (published = true);

CREATE POLICY "Only authenticated users can insert news" 
  ON news FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update news" 
  ON news FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Only authenticated users can delete news" 
  ON news FOR DELETE 
  TO authenticated 
  USING (true);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en VARCHAR(255) NOT NULL,
  title_bg VARCHAR(255) NOT NULL,
  description_en TEXT NOT NULL,
  description_bg TEXT NOT NULL,
  date DATE NOT NULL,
  image_url VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT false
);

-- Create index for faster queries
CREATE INDEX idx_achievements_date ON achievements(date);

-- Enable row-level security
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read published achievements" 
  ON achievements FOR SELECT 
  USING (published = true);

CREATE POLICY "Only authenticated users can insert achievements" 
  ON achievements FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update achievements" 
  ON achievements FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Only authenticated users can delete achievements" 
  ON achievements FOR DELETE 
  TO authenticated 
  USING (true);

COMMIT;
```

### 5. Environment Variables

Create a `.env.local` file in your project root (this file should not be committed to version control):

```
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
```

Note: The keys above are example development keys. For production, you should generate secure keys.

## Running the Development Environment

Follow these steps to start the development environment:

1. **Clone the repository and navigate to the project folder**:

```bash
git clone https://github.com/yourusername/aandb-school-site.git
cd aandb-school-site
```

2. **Create the necessary configuration files** as described above.

3. **Start the Docker containers**:

```bash
docker-compose up -d
```

4. **Initialize the Supabase database**:

The migrations will run automatically when the Supabase container starts.

5. **Access the applications**:

- Next.js application: http://localhost:3000
- Supabase Studio: http://localhost:54321

## Working with Supabase Locally

### Accessing Supabase Studio

Supabase Studio provides a web interface for managing your database. You can access it at http://localhost:54321.

Default credentials:
- Email: `admin@example.com`
- Password: `admin`

### Creating an Admin User

To create an admin user for your application:

1. Go to Supabase Studio at http://localhost:54321
2. Navigate to "Authentication" > "Users"
3. Click "Add User"
4. Enter the admin email and password
5. Click "Create User"

### Running Database Migrations

If you need to update your database schema:

1. Create a new migration file in the `supabase/migrations` directory with a sequential number prefix (e.g., `02_add_categories.sql`)
2. Add your SQL commands to the file
3. Restart the Supabase container to apply the migrations:

```bash
docker-compose restart supabase
```

## Common Tasks and Commands

### Viewing Logs

```bash
# View logs for all containers
docker-compose logs

# View logs for a specific container
docker-compose logs nextjs
docker-compose logs supabase

# Follow logs in real-time
docker-compose logs -f
```

### Stopping the Environment

```bash
docker-compose down
```

### Rebuilding Containers

```bash
docker-compose build
```

### Resetting the Database

If you need to reset the database to a clean state:

```bash
# Stop the containers
docker-compose down

# Remove the volume
docker volume rm aandb-school-site_supabase-data

# Start the containers again
docker-compose up -d
```

## Production Considerations

For production deployment, consider the following:

### 1. Separate Docker Compose Configuration

Create a `docker-compose.prod.yml` file with production-specific settings:

```yaml
version: '3.8'

services:
  nextjs:
    build:
      context: .
      dockerfile: Dockerfile.prod
    restart: always
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    ports:
      - "3000:3000"
```

### 2. Production Dockerfile

Create a `Dockerfile.prod` for production builds:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### 3. Using a Production Supabase Instance

For production, you should use a hosted Supabase instance rather than running it in Docker. Update your environment variables to point to your production Supabase URL and keys.

### 4. CI/CD Pipeline

Consider setting up a CI/CD pipeline that:

1. Builds the Docker image
2. Runs tests
3. Deploys to your hosting environment

### 5. Backup Strategy

Implement a regular backup strategy for your production database:

1. Use Supabase's built-in backup features
2. Set up scheduled database dumps
3. Store backups securely in multiple locations

## Conclusion

This Docker setup provides a consistent development environment for the A&B School website with Supabase integration. By using Docker, you ensure that all developers work with the same environment configuration, reducing "it works on my machine" issues.

For any issues or questions about this setup, please refer to the official documentation for [Docker](https://docs.docker.com/), [Docker Compose](https://docs.docker.com/compose/), and [Supabase](https://supabase.io/docs). 