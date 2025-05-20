# Linux Deployment Guide for AandB School Website

This guide provides instructions for deploying the AandB School Website on a Linux server.

## Prerequisites

- Node.js 18.17 or later
- PNPM 8.0 or later
- Nginx
- PM2 (for process management)

## Server Setup

### 1. Install Node.js and PNPM

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PNPM
npm install -g pnpm

# Install PM2
npm install -g pm2
```

### 2. Set Up Application Directory

```bash
# Create directory with proper permissions
sudo mkdir -p /var/www/aandbnext
sudo chown -R $USER:$USER /var/www/aandbnext
```

### 3. Clone Repository

```bash
cd /var/www/aandbnext
git clone https://your-repository-url.git .
```

### 4. Configure Environment Variables

Create a `.env.local` file in your project root with the necessary environment variables:

```bash
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOL
```

### 5. Install Dependencies and Build

```bash
pnpm install
pnpm build
```

### 6. Configure Nginx

Create an Nginx configuration file:

```bash
sudo bash -c 'cat > /etc/nginx/sites-available/aandb << EOL
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL'

# Enable the site and test configuration
sudo ln -sf /etc/nginx/sites-available/aandb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Set Up PM2 for Process Management

```bash
# Start the application with PM2
cd /var/www/aandbnext
pm2 start npm --name "aandb-next" -- start

# Save the PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
# Then follow the instructions provided by the command
```

## Troubleshooting

### Fixing Path Issues

If you encounter path-related issues, ensure all paths in your code use forward slashes (`/`) instead of backslashes (`\`).

### Permissions Problems

```bash
# Fix permissions if needed
sudo chown -R $USER:$USER /var/www/aandbnext
sudo chmod -R 755 /var/www/aandbnext
```

### Nginx 502 Bad Gateway

Check if your Next.js application is running:

```bash
pm2 list
pm2 logs aandb-next
```

### HTTPS Setup

To enable HTTPS with Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Updating the Application

```bash
cd /var/www/aandbnext
git pull
pnpm install
pnpm build
pm2 restart aandb-next
``` 