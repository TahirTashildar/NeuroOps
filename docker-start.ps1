# Docker Compose Startup Script for NeuroOps
# Starts all services and displays access information

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NeuroOps Docker Stack Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if docker is installed
try {
    docker --version | Out-Null
    Write-Host "✓ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed" -ForegroundColor Red
    exit 1
}

# Check if docker-compose is available
try {
    docker compose version | Out-Null
    Write-Host "✓ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose is not available" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting Docker services..." -ForegroundColor Yellow

# Start services in detached mode
docker compose up -d

# Wait for services to be ready
Write-Host ""
Write-Host "Waiting for services to become healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check service status
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Cyan
docker compose ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Services are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Access your services at:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend Dashboard:      http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API:             http://localhost:3001" -ForegroundColor Cyan
Write-Host "Backend Health:          http://localhost:3001/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Observability Stack:" -ForegroundColor Yellow
Write-Host "Prometheus:              http://localhost:9090" -ForegroundColor Cyan
Write-Host "Grafana:                 http://localhost:3002 (admin/admin)" -ForegroundColor Cyan
Write-Host "Jaeger:                  http://localhost:16686" -ForegroundColor Cyan
Write-Host "Loki:                    http://localhost:3100" -ForegroundColor Cyan
Write-Host ""

Write-Host "Useful Docker commands:" -ForegroundColor Yellow
Write-Host "View logs:               docker compose logs -f backend" -ForegroundColor Gray
Write-Host "Stop services:           docker compose down" -ForegroundColor Gray
Write-Host "Restart services:        docker compose restart" -ForegroundColor Gray
Write-Host ""

Write-Host "Testing backend connectivity..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Try to check backend health
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "Backend is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "Backend not ready yet, check logs: docker compose logs backend" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup complete! Visit http://localhost:3000 to see the dashboard." -ForegroundColor Green
