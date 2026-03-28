# NeuroOps Railway Deployment Guide

## Prerequisites
1. Railway account (railway.app)
2. Project code pushed to GitHub
3. PostgreSQL and Redis services available

## Deployment Steps

### 1. Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your NeuroOps repository
4. Choose deployment type: "NodeJS"

### 2. Configure Services

#### Add PostgreSQL
```bash
# In Railway Dashboard:
1. Click "Add Service" → "Database" → "PostgreSQL"
2. Auto-generates DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
```

#### Add Redis (Optional but Recommended)
```bash
# In Railway Dashboard:
1. Click "Add Service" → "Database" → "Redis"
2. Auto-generates REDIS_HOST, REDIS_PORT
```

### 3. Configure Environment Variables

Set these in Railway Dashboard → Variables:

```env
# Core
NODE_ENV=production
API_HOST=0.0.0.0
API_PORT=$PORT

# Database (auto-set by Railway)
DB_HOST=[auto-filled]
DB_PORT=[auto-filled]
DB_NAME=[auto-filled]
DB_USER=[auto-filled]
DB_PASSWORD=[auto-filled]
DB_SSL=true

# Redis (if used)
REDIS_HOST=[auto-filled]
REDIS_PORT=[auto-filled]
REDIS_PASSWORD=[auto-filled]

# Optional Features
ENABLE_CLAUDE_AI=false
JAEGER_ENDPOINT=  # Leave empty to disable tracing
```

### 4. Configure Build & Start

**Build Command:**
```bash
npm run build --workspace=backend
```

**Start Command:**
```bash
node backend/dist/index.js
```

These are set in `railway.toml` (already configured).

### 5. Deploy

```bash
# Push code to GitHub
git push origin main

# Railway auto-deploys on push
# Monitor logs in Railway Dashboard
```

## Troubleshooting

### Issue: "Failed to start server"

**Solutions:**
1. Ensure `dist/` folder exists - check build logs
2. Verify `API_HOST=0.0.0.0` (not localhost)
3. Check that `NODE_ENV=production`
4. Verify database connection string:
   ```bash
   postgresql://user:password@host:5432/dbname
   ```

### Issue: Database connection fails

**Solutions:**
1. Enable `DB_SSL=true`
2. Add Railway IP to database firewall
3. Verify credentials in environment variables
4. Check PostgreSQL service is running

### Issue: Port binding error

**Solutions:**
1. Railway assigns `PORT` env variable - code must use it
2. Verify `api Port: process.env.PORT || 3001` in config

## Monitoring

### View Logs
```
Railway Dashboard → Logs tab → Real-time output
```

### Monitor Health
```
GET https://your-app.railway.app/health
```

### Check Metrics
```
GET https://your-app.railway.app/metrics
```

## Rollback

If deployment fails:
1. Railway Dashboard → Deployments tab
2. Click previous successful deployment
3. Click "Redeploy"

## Manual Railway CLI Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs

# Set environment variables
railway variables set API_HOST 0.0.0.0
railway variables set NODE_ENV production
```

## Production Checklist

- [x] Build script runs successfully
- [x] API_HOST set to 0.0.0.0
- [x] NODE_ENV=production
- [x] Database variables configured
- [x] Redis configured (optional)
- [x] Health check endpoint responds
- [x] Metrics endpoint accessible
- [x] Logs viewable in Railway dashboard

## After Deployment

1. Test health endpoint:
   ```bash
   curl https://your-app.railway.app/health
   ```

2. Check frontend can reach API:
   - Deploy frontend separately or update API URL

3. Monitor for errors:
   - Watch Railway logs for crash loops

## Cost

Railway pricing:
- Starter: Free tier ($5 credit)
- Pay-as-you-go: Compute hours + data transfer
- PostgreSQL: Included in compute tier
- Redis: Additional cost

## Support

- Railway Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
