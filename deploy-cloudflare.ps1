# A&B School Website Deployment Script for Cloudflare Pages
Write-Host "Starting deployment process for A&B School Website..." -ForegroundColor Cyan

# Build the Next.js application
Write-Host "Building the Next.js application..." -ForegroundColor Yellow
npm run build

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build completed successfully" -ForegroundColor Green
    
    # Deploy to Cloudflare Pages
    Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor Yellow
    npx wrangler pages deploy out --project-name aandb-school-website --commit-dirty=true
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Deployment completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Deployment failed. Please check the errors above." -ForegroundColor Red
    }
} else {
    Write-Host "Build failed. Please check the errors above." -ForegroundColor Red
} 