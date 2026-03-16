# Constraint Theory - Local Development Script (PowerShell)
# This script sets up and runs the local development environment

$ErrorActionPreference = "Stop"

Write-Host "🚀 Constraint Theory - Local Development Setup" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Blue

try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js v20+" -ForegroundColor Red
    exit 1
}

try {
    $wranglerVersion = wrangler --version
    Write-Host "✓ Wrangler: $wranglerVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ Wrangler CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g wrangler
}

try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ Docker not found. Docker features will be unavailable." -ForegroundColor Yellow
}

Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Blue
Set-Location workers
npm install
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Build TypeScript
Write-Host "Building TypeScript..." -ForegroundColor Blue
npm run build
Write-Host "✓ TypeScript built" -ForegroundColor Green
Write-Host ""

# Build WASM module (if Rust is installed)
try {
    $wasmPackVersion = wasm-pack --version
    Write-Host "Building WASM module..." -ForegroundColor Blue
    Set-Location ..\packages\constraint-theory-wasm
    wasm-pack build --target web
    Set-Location ..\..
    Write-Host "✓ WASM module built" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "⚠ Rust/WASM not found. Skipping WASM build." -ForegroundColor Yellow
    Write-Host ""
}

# Check if KV namespaces are configured
Write-Host "Checking KV namespaces..." -ForegroundColor Blue
$wranglerToml = Get-Content workers\wrangler.toml -Raw
if ($wranglerToml -match 'id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"') {
    Write-Host "⚠ KV namespaces not configured. Run 'wrangler kv:namespace create' to set them up." -ForegroundColor Yellow
} else {
    Write-Host "✓ KV namespaces configured" -ForegroundColor Green
}
Write-Host ""

# Menu
Write-Host "What would you like to do?"
Write-Host ""
Write-Host "1) Start Workers development server"
Write-Host "2) Build Docker container"
Write-Host "3) Run tests"
Write-Host "4) Deploy to Workers (staging)"
Write-Host "5) Deploy to Workers (production)"
Write-Host "6) View logs"
Write-Host "7) Exit"
Write-Host ""
$choice = Read-Host "Enter your choice (1-7)"

switch ($choice) {
    "1" {
        Write-Host "Starting Workers development server..." -ForegroundColor Green
        Set-Location workers
        wrangler dev
    }
    "2" {
        if (Get-Command docker -ErrorAction SilentlyContinue) {
            Write-Host "Building Docker container..." -ForegroundColor Green
            Set-Location docker
            docker build -t constraint-theory-worker:latest ..
            Write-Host "✓ Docker image built" -ForegroundColor Green
            Write-Host "Run 'docker run -p 8080:8080 constraint-theory-worker:latest' to start"
        } else {
            Write-Host "✗ Docker not found. Please install Docker." -ForegroundColor Red
        }
    }
    "3" {
        Write-Host "Running tests..." -ForegroundColor Green
        Set-Location workers
        npm test
    }
    "4" {
        Write-Host "Deploying to staging..." -ForegroundColor Yellow
        Set-Location workers
        wrangler deploy
    }
    "5" {
        Write-Host "Deploying to production..." -ForegroundColor Yellow
        Set-Location workers
        wrangler deploy --env production
    }
    "6" {
        Write-Host "Tailing logs..." -ForegroundColor Green
        Set-Location workers
        wrangler tail --format pretty
    }
    "7" {
        Write-Host "Goodbye! 👋"
        exit 0
    }
    default {
        Write-Host "✗ Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}
