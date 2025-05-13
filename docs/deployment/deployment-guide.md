# Deployment Guide

This document provides instructions for deploying the A&B School website to production environments.

## Prerequisites

Before deployment, ensure you have:

1. A Supabase project set up with:
   - Database tables created
   - Authentication configured
   - Storage buckets set up
   - Row-Level Security policies configured

2. A hosting platform that supports Next.js applications:
   - Vercel (recommended)
   - Netlify
   - AWS Amplify
   - Self-hosted server

3. Environment variables ready:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

## Deployment to Vercel (Recommended)

Vercel offers the best integration with Next.js applications.

1. **Connect Repository**:
   - Sign up for a Vercel account
   - Import your GitHub/GitLab/Bitbucket repository
   - Select the A&B School Website repository

2. **Configure Project**:
   - Framework Preset: Next.js
   - Build Command: `pnpm build` (or configure to use pnpm)
   - Output Directory: `.next`
   - Install Command: `pnpm install`

3. **Environment Variables**:
   - Add all required environment variables in the Vercel project settings
   - Ensure production and preview environments have appropriate variable values

4. **Deploy**:
   - Click "Deploy" and wait for the build to complete
   - Vercel will automatically deploy to a production URL

5. **Custom Domain** (Optional):
   - Add your custom domain in Vercel project settings
   - Follow the DNS configuration instructions

## Self-Hosted Deployment

For self-hosted environments:

1. **Build the Application**:
   ```bash
   pnpm build
   ```

2. **Start the Production Server**:
   ```bash
   pnpm start
   ```

3. **Using PM2 for Process Management**:
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start with PM2
   pm2 start npm --name "aandb-website" -- start
   
   # Ensure PM2 starts on system boot
   pm2 startup
   pm2 save
   ```

4. **Nginx Configuration**:
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

5. **SSL with Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## Docker Deployment

A Docker setup is available in the `docker` directory:

1. **Build the Docker Image**:
   ```bash
   docker build -t aandb-website .
   ```

2. **Run the Container**:
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=your_url \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
     -e SUPABASE_SERVICE_ROLE_KEY=your_service_key \
     aandb-website
   ```

3. **Using Docker Compose**:
   ```bash
   cd docker
   docker-compose up -d
   ```

## Post-Deployment Setup

After deployment, complete these steps:

1. **Create Admin User**:
   - Access your Supabase dashboard
   - Navigate to Authentication → Users
   - Create a user for admin access
   - Set a secure password

2. **Test Admin Access**:
   - Go to `/admin/login` on your deployed site
   - Log in with the admin credentials
   - Verify you can access the admin dashboard

3. **Setup Storage Buckets** (if not done already):
   - Use the scripts to set up storage buckets:
     ```bash
     pnpm run setup-storage
     ```
   - Or set them up manually in the Supabase dashboard

## Troubleshooting

Common deployment issues:

1. **Build Failures**:
   - Check your package.json scripts
   - Ensure all dependencies are installed
   - Verify Node.js version compatibility

2. **Authentication Issues**:
   - Verify environment variables are correctly set
   - Check Supabase project configuration
   - Ensure domains are configured in Supabase auth settings

3. **File Upload Problems**:
   - Check storage bucket permissions
   - Verify service role key has appropriate permissions
   - Check file size limits in Supabase storage settings

4. **Database Connection Issues**:
   - Ensure Supabase project is active and not paused
   - Verify database credentials and connection strings
   - Check for IP restrictions in Supabase settings 