# A&B School Website Deployment Script
# This script helps automate the build process

Write-Host "🚀 Starting build process for A&B School Website..." -ForegroundColor Cyan

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
Write-Host "🌐 The build output is in the .next directory" -ForegroundColor Cyan
Write-Host "📝 Deploy according to your hosting provider's instructions" -ForegroundColor Yellow 