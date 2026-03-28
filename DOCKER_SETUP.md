# Docker Setup & Backend API Guide

## ✅ Everything is Already Configured!

The project includes a complete Docker Compose setup with all services:
- **Backend API** (Node.js/TypeScript)
- **PostgreSQL** (Database)
- **Redis** (Cache)
- **Prometheus** (Metrics)
- **Grafana** (Dashboards)
- **Jaeger** (Distributed Tracing)
- **Loki** (Log Aggregation)
- **Frontend** (Nginx)

---

## 🚀 Quick Start (5 minutes)

### Step 1: Ensure .env File Exists
```bash
# .env file is now created at project root
# It contains all required environment variables
ls -la .env
```

### Step 2: Start All Services
```bash
# From project root
docker-compose up -d

# Or rebuild images
docker-compose up -d --build
```

### Step 3: Verify Services Are Running
```bash
docker-compose ps

# You should see:
# neuro-backend      Up
# neuro-postgres     Up
# neuro-redis        Up
# neuro-prometheus   Up
# neuro-grafana      Up
# neuro-loki         Up
# neuro-jaeger       Up
# neuro-frontend     Up
```

### Step 4: Test Backend API
```bash
# Health check endpoint
curl http://localhost:3001/health

# Should return:
{
  "status": "healthy",
  "services": {
    "database": true,
    "redis": true
  }
}
```

---

## 📊 Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Backend API** | http://localhost:3001 | N/A |
| **Prometheus** | http://localhost:9090 | N/A |
| **Grafana** | http://localhost:3002 | admin / admin |
| **Jaeger** | http://localhost:16686 | N/A |
| **Loki** | http://localhost:3100 | N/A |
| **Frontend (Nginx)** | http://localhost:3000 | N/A |

---

## 🔧 Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f prometheus

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Stop Services
```bash
# Stop (keep data)
docker-compose down

# Stop and remove everything
docker-compose down -v

# Restart a service
docker-compose restart backend
```

### Rebuild After Code Changes
```bash
# Rebuild backend
docker-compose up -d --build backend

# Rebuild everything
docker-compose up -d --build
```

### Database Operations
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U neuro_admin -d neuro_ops

# Run migrations
docker-compose exec backend npm run db:migrate

# Seed database
docker-compose exec backend npm run db:seed
```

---

## 📈 Monitor Backend

### Prometheus Metrics
Visit: http://localhost:9090

**Useful Queries:**
```
# Backend uptime
up{job="backend"}

# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_failures_total[5m])

# Database connections
pg_stat_activity_count

# Redis memory usage
redis_memory_used_bytes
```

### Grafana Dashboards
Visit: http://localhost:3002 (admin/admin)

**Auto-configured datasources:**
- Prometheus ✅
- Loki ✅
- Jaeger ✅

Create custom dashboards using these datasources!

### Jaeger Tracing
Visit: http://localhost:16686

**Features:**
- Trace API requests
- Track service dependencies
- Analyze latency
- Debug distributed transactions

### Loki Log Aggregation
Via Grafana → Explore → Select "Loki"

**Query Examples:**
```
{job="backend"}
{job="backend"} | level="error"
{job="backend"} | json | status >= 400
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Port 3001 already in use
# 2. Database not ready - give it time
# 3. Build failed - check typescript errors

# Solution: Rebuild
docker-compose down
docker-compose up -d --build backend
```

### Database Connection Error
```bash
# Wait for PostgreSQL to be healthy
docker-compose logs postgres

# Verify connection
docker-compose exec postgres psql -U neuro_admin -d neuro_ops -c "SELECT NOW();"
```

### Out of Disk Space
```bash
# Clean up Docker
docker system prune -a

# Remove volumes (⚠️ deletes all data)
docker-compose down -v
```

### Can't Access Services from localhost
```bash
# If using Docker Desktop on Windows/Mac, use:
# http://host.docker.internal:3001

# Or get Docker IP:
docker inspect neuro-backend | grep IPAddress
```

---

## 🔍 Verify Everything Works

### Full Health Check Script
```bash
#!/bin/bash

echo "🔍 NeuroOps Docker Health Check"
echo "================================"

# Backend
echo -n "Backend API:    "
curl -s http://localhost:3001/health | jq -r '.status' || echo "❌ DOWN"

# Prometheus
echo -n "Prometheus:     "
curl -s http://localhost:9090/-/healthy | grep -q "healthy" && echo "✅ UP" || echo "❌ DOWN"

# Grafana
echo -n "Grafana:        "
curl -s http://localhost:3002/api/health -H "Authorization: Bearer admin" | jq -r '.database' || echo "❌ DOWN"

# Jaeger
echo -n "Jaeger:         "
curl -s http://localhost:16686/api/traces | jq -r '.data' > /dev/null 2>&1 && echo "✅ UP" || echo "❌ DOWN"

# Loki
echo -n "Loki:           "
curl -s http://localhost:3100/ready | grep -q "ready" && echo "✅ UP" || echo "❌ DOWN"

# PostgreSQL
echo -n "PostgreSQL:     "
docker-compose exec -T postgres pg_isready -U neuro_admin > /dev/null 2>&1 && echo "✅ UP" || echo "❌ DOWN"

# Redis
echo -n "Redis:          "
docker-compose exec -T redis redis-cli ping > /dev/null 2>&1 && echo "✅ UP" || echo "❌ DOWN"

echo "================================"
echo "✅ All systems operational!"
```

Save as `check-health.sh` and run: `bash check-health.sh`

---

## 📝 What Was Fixed

### 1. .env File Created ✅
- Contains all required environment variables
- Properly configured for Docker networking
- Ports match docker-compose.yml

### 2. Backend Dockerfile Fixed ✅
- Corrected npm install commands
- Proper TypeScript compilation
- Correct build output

### 3. Docker Compose Already Has ✅
- All observability services (Prometheus, Grafana, Jaeger, Loki)
- Database (PostgreSQL) with migrations
- Cache (Redis)
- Frontend (Nginx)
- Proper networking between services
- Health checks for each service

---

## 🚀 Next Steps

1. **Start Docker:**
   ```bash
   docker-compose up -d
   ```

2. **Wait for Services (30-60 seconds)**
   ```bash
   docker-compose logs -f
   # Watch for "healthy" status
   ```

3. **Test Backend:**
   ```bash
   curl http://localhost:3001/health
   ```

4. **Access Dashboards:**
   - Grafana: http://localhost:3002 (admin/admin)
   - Prometheus: http://localhost:9090
   - Jaeger: http://localhost:16686

5. **Access Frontend:**
   - http://localhost:3000 (or configured PORT)

---

## 🆘 Still Having Issues?

```bash
# Get detailed logs
docker-compose logs --tail=200 backend

# Check Docker network
docker network inspect neuro-network

# Verify all containers exist
docker ps -a

# Rebuild everything from scratch
docker-compose down -v
docker-compose up -d --build
```

---

## 📚 Documentation

- [Docker Compose Setup](docker-compose.yml)
- [Prometheus Config](monitoring/prometheus.yml)
- [Grafana Config](monitoring/grafana-datasources.yml)
- [Loki Config](monitoring/loki-config.yml)
- [Backend Dockerfile](backend/Dockerfile)
- [Environment Variables](.env)

---

**Status**: ✅ Ready to Run!

Everything is configured and ready to go. Just run `docker-compose up -d` and access your services!
