# Supabase Setup Guide for A&B School Website

This guide will help you set up Supabase for your A&B School Website project.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com) and sign up or log in
2. Click "New Project"
3. Fill in the details:
   - Name: AandB-School
   - Database Password: (create a secure password and save it)
   - Region: Select a region close to you (EU if you're in Bulgaria)
   - Pricing Plan: Free tier
4. Click "Create new project" and wait for it to be created (a few minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click on "Project Settings" (gear icon) in the sidebar
2. Click "API" in the submenu
3. Copy the "Project URL" (it will look like `https://xyz123.supabase.co`)
4. Copy the "anon/public" key (it will be a long string)

## Step 3: Set Up Environment Variables

1. Open your `.env.local` file
2. Update it with your real credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-real-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-real-anon-key
```

## Step 4: Create the Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the contents of your `database/schema.sql` file
4. Click "Run" to execute the SQL and create your tables

## Step 5: Test the Connection

1. Run the test script: `node test-supabase.js`
2. If successful, you should see a message confirming the connection

## Step 6: Start Your Application

1. Run the development server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Troubleshooting

- If you see a "fetch failed" error, double-check your Supabase URL and API key
- If you see a "CORS" error, check your Supabase project settings > API > CORS
- If you're behind a corporate firewall or VPN, try connecting through a different network

## Next Steps

- Add admin users in Supabase Authentication
- Seed your database with initial data using `node database/seed.js`
- Set up Row Level Security (RLS) for production use 