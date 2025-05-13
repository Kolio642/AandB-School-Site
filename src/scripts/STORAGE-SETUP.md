# Supabase Storage Setup for A&B School Website

This document explains how to set up the required storage buckets for the A&B School website using the automated setup script.

## Prerequisites

Before running the setup script, ensure you have:

1. A Supabase project created
2. The following environment variables set in your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (NOT the anon key)

## Running the Setup Script

The setup script will create all necessary buckets with proper permissions. To run it:

```bash
pnpm run setup-storage
```

This will:

1. Create the following buckets (if they don't already exist):
   - `teachers` - For teacher profile images
   - `news` - For news article images
   - `achievements` - For student achievement files
   - `public1` - General purpose bucket

2. Set up appropriate folder structure in buckets that need it:
   - In the `achievements` bucket: `certificates`, `awards`, `competitions`, `academic`

3. Configure proper security policies for each bucket:
   - Public read access for all users
   - Write access (create/update/delete) restricted to authenticated admin users only

## Security Policies

The script sets up Row Level Security (RLS) policies for each bucket:

1. **SELECT Policy**: Anyone can view files (public access)
2. **INSERT Policy**: Only authenticated users can upload files
3. **UPDATE Policy**: Only authenticated users can update files
4. **DELETE Policy**: Only authenticated users can delete files

These policies ensure that your storage is secure while still allowing public access to view images and files.

## Bucket Configuration Details

The script configures the buckets with the following settings:

| Bucket Name | Public Access | File Size Limit | Special Configurations | Security |
|-------------|---------------|----------------|------------------------|----------|
| teachers    | Yes           | 5MB            | Images only (jpeg, png, webp) | Read: Public, Write: Auth Only |
| news        | Yes           | 10MB           | Images only (jpeg, png, webp, gif) | Read: Public, Write: Auth Only |
| achievements| Yes           | 15MB           | With folder structure | Read: Public, Write: Auth Only |
| public1     | Yes           | 20MB           | General purpose | Read: Public, Write: Auth Only |

## Troubleshooting

If you encounter issues:

1. **Permission errors**: Ensure your `SUPABASE_SERVICE_ROLE_KEY` has the necessary permissions
2. **"Bucket already exists" warnings**: These are normal if you run the script multiple times
3. **Policy creation failures**: The script will attempt multiple methods to create policies:
   - Using a custom RPC function
   - Using direct SQL statements
   - If both fail, you'll need to create the policies manually in the dashboard

## Manual Policy Setup

If the script cannot create policies automatically, you can set them up manually in the Supabase dashboard:

1. Go to Storage → Policies in the Supabase dashboard
2. Enable Row Level Security on the objects table if not already enabled
3. For each bucket, create the following policies:
   - **Public Read**: `bucket_id = 'bucket_name'` for SELECT
   - **Auth Insert**: `bucket_id = 'bucket_name' AND auth.role() = 'authenticated'` for INSERT
   - **Auth Update**: `bucket_id = 'bucket_name' AND auth.role() = 'authenticated'` for UPDATE
   - **Auth Delete**: `bucket_id = 'bucket_name' AND auth.role() = 'authenticated'` for DELETE

## Additional Configuration

While this script handles bucket creation and security policies, you may still need to:

1. Configure CORS settings in the Supabase dashboard if needed
2. Adjust bucket policies for more granular access control if required

For more details on Supabase Storage, see the [official documentation](https://supabase.com/docs/guides/storage). 