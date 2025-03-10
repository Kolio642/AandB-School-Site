# A&B School Website Deployment Script for Cloudflare Pages
# This script helps automate the deployment process

Write-Host "🚀 Starting deployment process for A&B School Website..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH. Please install Node.js 18 or later." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm -v
    Write-Host "✅ npm $npmVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Build the project
Write-Host "🔨 Building the project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully" -ForegroundColor Green

# Check if Wrangler is installed
try {
    $wranglerVersion = npx wrangler -v
    Write-Host "✅ Wrangler detected" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Wrangler not found. Installing..." -ForegroundColor Yellow
    npm install -g wrangler
}

# Deploy to Cloudflare Pages
Write-Host "🚀 Deploying to Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy .next

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed. Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Your website should be available at your Cloudflare Pages URL" -ForegroundColor Cyan 