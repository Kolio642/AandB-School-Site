# Script to clean up node_modules and reinstall with pnpm
Write-Host "===== Starting dependency cleanup and reinstallation with pnpm =====" -ForegroundColor Cyan

# Step 1: Create backup of package.json
Write-Host "Step 1: Creating backup of package.json" -ForegroundColor Yellow
Copy-Item -Path "package.json" -Destination "package.json.backup" -Force

# Step 2: Clean up existing dependencies
Write-Host "Step 2: Removing node_modules and lock files" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  - Removing node_modules folder..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path "package-lock.json") {
    Write-Host "  - Removing package-lock.json..." -ForegroundColor Gray
    Remove-Item "package-lock.json"
}

if (Test-Path "yarn.lock") {
    Write-Host "  - Removing yarn.lock..." -ForegroundColor Gray
    Remove-Item "yarn.lock"
}

if (Test-Path "pnpm-lock.yaml") {
    Write-Host "  - Removing pnpm-lock.yaml..." -ForegroundColor Gray
    Remove-Item "pnpm-lock.yaml"
}

# Step 3: Install pnpm if not already installed
Write-Host "Step 3: Ensuring pnpm is installed" -ForegroundColor Yellow
try {
    pnpm --version
    Write-Host "  - pnpm is already installed" -ForegroundColor Gray
} catch {
    Write-Host "  - Installing pnpm globally..." -ForegroundColor Gray
    npm install -g pnpm
}

# Step 4: Install dependencies with pnpm
Write-Host "Step 4: Installing dependencies with pnpm" -ForegroundColor Yellow
pnpm install

# Step 5: Check for successful installation
Write-Host "Step 5: Verifying installation" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  - Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "  - Error: Dependencies installation failed!" -ForegroundColor Red
}

Write-Host "===== Dependency reinstallation complete =====" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Magenta
Write-Host "1. Run 'pnpm dev' to start the development server" -ForegroundColor Magenta
Write-Host "2. Check the authentication redirect functionality" -ForegroundColor Magenta 