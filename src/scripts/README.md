# Storage Setup for A&B School Site

This directory contains scripts to set up and manage Supabase storage for the website.

## Creating the 'teachers' Bucket

There are two ways to create the required 'teachers' bucket:

### 1. Using the JavaScript Script

Run the following command in the project root:

```bash
npm run create-bucket
```

This script requires the following environment variables to be set:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (not the anon key)

### 2. Using the Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Storage in the sidebar
3. Click "New Bucket"
4. Name the bucket "teachers"
5. Set it to "Public" bucket type
6. Click "Create bucket"

### 3. Using SQL Migrations

You can also apply the SQL migration directly:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the file `supabase/migrations/03_storage_policies.sql`
4. Run the SQL to create the bucket and policies

## Troubleshooting

If you see errors like "Bucket not found" when uploading images:
1. Verify the bucket exists in Supabase Storage
2. Ensure the bucket name in your code matches exactly ("teachers")
3. Check that proper RLS policies are in place to allow uploads

## Storage Access Policies

The following policies are created for the teachers bucket:

1. Public read access to all files
2. Authenticated users can upload, update, and delete files 