# Docker Setup for A&B School Website

This directory contains Docker configuration files for deploying the A&B School Website.

## Files

- `Dockerfile`: Configuration for building the Next.js application container
- `docker-compose.yml`: Orchestration for running the application and optional Supabase database for local development

## Docker Configuration

### Dockerfile

The Dockerfile uses a multi-stage build approach to create a minimal production image:

1. **Build Stage**:
   - Uses Node.js Alpine as base image
   - Installs dependencies
   - Builds the Next.js application
   
2. **Production Stage**:
   - Uses a smaller Node.js runtime image
   - Copies only the necessary files from the build stage
   - Configures the application to run as a non-root user

### Docker Compose

The `docker-compose.yml` file defines:

1. **nextjs**: The main application container
   - Built from the project's Dockerfile
   - Exposes port 3000
   - Sets necessary environment variables
   
2. **supabase-db**: Local PostgreSQL database (for development)
   - Uses the official Supabase PostgreSQL image
   - Configured with default credentials
   - Data persisted in a Docker volume

3. **supabase-api**: Local Supabase API (for development)
   - Connects to the PostgreSQL database
   - Provides authentication and database access

## Usage

### Production Deployment

For production deployment (with external Supabase):

```bash
# From the project root
cd docker
docker-compose up -d nextjs
```

This will:
1. Build the Next.js application container
2. Start only the application container
3. Connect to your external Supabase instance

### Local Development with Supabase

For local development with a self-contained Supabase instance:

```bash
# From the project root
cd docker
docker-compose up -d
```

This will:
1. Start the Next.js application container
2. Start a local PostgreSQL database container
3. Start a local Supabase API container
4. Configure them to work together

### Building the Docker Image Manually

To build the Docker image manually:

```bash
docker build -t aandb-school-site -f docker/Dockerfile .
```

### Running the Docker Image Manually

To run the Docker image manually:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-supabase-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  aandb-school-site
```

## Environment Variables

Make sure to set the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `JWT_SECRET`: Secret for JWT tokens (local Supabase only)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (local Supabase only)

You can set these variables in multiple ways:
1. By editing the `.env.local` file (which gets copied to the container)
2. By setting them in the `docker-compose.yml` file
3. By passing them as arguments to `docker run`

## Production Deployment Considerations

### Resource Requirements

The application container has the following resource requirements:
- RAM: Minimum 512MB, recommended 1GB+
- CPU: 1 core minimum
- Disk: 1GB minimum

### Security Considerations

1. **Non-root User**: The container runs as a non-root user
2. **Environment Variables**: Sensitive data is passed via environment variables
3. **Network Security**: Only port 3000 is exposed
4. **Container Hardening**: Minimized attack surface with multi-stage build

### Health Checks

The container includes a health check that verifies the application is running properly.

## Volumes

- `supabase-data`: Persistent volume for Supabase PostgreSQL data
  - Stores database files
  - Persists data between container restarts
  - Located at `/var/lib/postgresql/data`

## Networks

- `aandb-network`: Bridge network for communication between containers
  - Allows containers to communicate using service names
  - Isolates the containers from other Docker networks

## Troubleshooting

### Common Issues

1. **Container doesn't start**:
   - Check Docker logs: `docker-compose logs nextjs`
   - Verify environment variables are set correctly
   - Ensure ports aren't already in use

2. **Database connection issues**:
   - Check if Supabase containers are running: `docker-compose ps`
   - Verify database credentials in environment variables
   - Try connecting directly to the database: `docker exec -it supabase-db psql -U postgres`

3. **Performance issues**:
   - Monitor container resources: `docker stats`
   - Consider increasing container memory limits
   - Check for memory leaks using Node.js tools

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f nextjs

# Restart container
docker-compose restart nextjs

# Check container health
docker inspect --format "{{.State.Health.Status}}" $(docker-compose ps -q nextjs)

# Shell into container
docker-compose exec nextjs /bin/sh

# Inspect container resources
docker stats $(docker-compose ps -q)
```

## Upgrading

To upgrade the application:

1. Pull the latest code changes
2. Rebuild the Docker image: `docker-compose build nextjs`
3. Restart the container: `docker-compose up -d nextjs`

For a clean upgrade, you can stop and remove containers first:

```bash
docker-compose down
docker-compose up -d
``` 