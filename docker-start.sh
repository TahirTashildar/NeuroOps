#!/bin/bash

# Docker Compose Startup Script for NeuroOps
# Starts all services and displays access information

echo "========================================"
echo "NeuroOps Docker Stack Startup"
echo "========================================"
echo ""

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed"
    exit 1
fi
echo "✓ Docker is installed"

# Check if docker-compose is available
if ! docker compose --version &> /dev/null; then
    echo "✗ Docker Compose is not available"
    exit 1
fi
echo "✓ Docker Compose is available"

echo ""
echo "Starting Docker services..."

# Start services in detached mode
docker compose up -d

# Wait for services to be ready
echo ""
echo "Waiting for services to become healthy..."
sleep 5

# Check service status
echo ""
echo "Service Status:"
docker compose ps

echo ""
echo "========================================"
echo "Services are starting!"
echo "========================================"
echo ""

echo "Access your services at:"
echo ""
echo "Frontend Dashboard:      http://localhost:3000"
echo "Backend API:             http://localhost:3001"
echo "Backend Health:          http://localhost:3001/health"
echo ""
echo "Observability Stack:"
echo "Prometheus:              http://localhost:9090"
echo "Grafana:                 http://localhost:3002 (admin/admin)"
echo "Jaeger:                  http://localhost:16686"
echo "Loki:                    http://localhost:3100"
echo ""

echo "Useful Docker commands:"
echo "View logs:               docker compose logs -f backend"
echo "Stop services:           docker compose down"
echo "Restart services:        docker compose restart"
echo ""

echo "Testing backend connectivity..."
sleep 2

# Try to check backend health using curl
if command -v curl &> /dev/null; then
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "✓ Backend is responding"
    else
        echo "⚠ Backend not ready yet, check logs: docker compose logs backend"
    fi
fi

echo ""
echo "Setup complete! Visit http://localhost:3000 to see the dashboard."
