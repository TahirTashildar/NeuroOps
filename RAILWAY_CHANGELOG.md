# Railway Deployment - Detailed Fix Changelog

**Date**: March 28, 2026  
**Issue**: Server crash on Railway: `Failed to start server`  
**Status**: ✅ RESOLVED

---

## Root Cause Analysis

The application was failing with:
```
npm error code 1
Failed to start server
Command failed: sh -c node dist/index.js
```

**Why?**
1. Railway didn't run the build process
2. The `dist/` folder was empty (TypeScript not compiled)
3. `node dist/index.js` failed because `dist/` didn't exist
4. App was also trying to bind to `localhost` (invalid for Railway)

---

## Files Modified

### 1. ✨ NEW: `railway.toml`

**Location**: `/railway.toml`

**What**: Railway platform configuration

**Content**:
```toml
[build]
builder = "nixpacks"
buildCommand = "cd backend && npm install && npm run build"

[start]
cmd = "cd backend && node dist/index.js"

[env]
NODE_ENV = "production"
API_HOST = "0.0.0.0"
API_PORT = "$PORT"
DB_SSL = "true"
```

**Why**: 
- Tells Railway how to build the project
- Compiles TypeScript before starting
- Sets production environment automatically

---

### 2. Updated: `backend/package.json`

**Location**: `/backend/package.json`

**Changes**:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    
    // ADDED:
    "start:prod": "NODE_ENV=production node dist/index.js",
    "postinstall": "npm run build",
    
    "db:migrate": "ts-node src/db/migrate.ts",
    // ... rest unchanged
  }
}
```

**Changes Explained**:
- ✅ `postinstall`: Automatically builds TypeScript after npm install
- ✅ `start:prod`: Convenient production start command

**Result**: When Railway runs `npm install`, it now automatically compiles TypeScript

---

### 3. Updated: `backend/src/config/index.ts`

**Location**: `/backend/src/config/index.ts`

**Before**:
```typescript
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.API_PORT || '3001', 10),
  apiHost: process.env.API_HOST || 'localhost',
  // ...
}
```

**After**:
```typescript
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || process.env.API_PORT || '3001', 10),
  apiHost: process.env.API_HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'),
  // ...
}
```

**Changes**:
- ✅ reads `process.env.PORT` (Railway's assigned port)
- ✅ falls back to `process.env.API_PORT` for compatibility
- ✅ defaults to 3001 for local development
- ✅ binds to `0.0.0.0` in production (required for Railway)
- ✅ binds to `localhost` in development

**Why**:
- Railway dynamically assigns a PORT variable
- App must read it to work correctly
- `0.0.0.0` accepts connections from anywhere (needed for Railway)
- `localhost` only accepts local connections (breaks in containers)

---

## Deployment Flow (Before vs After)

### ❌ BEFORE (Broken)
```
1. Railway clones repo
2. Runs: npm install (no build)
3. Runs: node dist/index.js
4. ERROR: dist/ doesn't exist
5. Server crashes
```

### ✅ AFTER (Fixed)
```
1. Railway clones repo
2. Reads railway.toml
3. Runs: cd backend && npm install && npm run build
4. TypeScript compiles → dist/ created
5. Runs: cd backend && node dist/index.js
6. ✓ Server starts successfully!
7. Listens on 0.0.0.0:PORT (Railway's port)
```

---

## Environment Variables

### Railway Automatically Sets:
```env
PORT=<random-port-assigned-by-railway>
NODE_ENV=production  # From railway.toml
API_HOST=0.0.0.0     # From railway.toml
DB_SSL=true          # From railway.toml
```

### You Must Configure:
```env
# From PostgreSQL service:
DB_HOST=<postgres-host>
DB_PORT=5432
DB_NAME=neuro_ops
DB_USER=<postgres-user>
DB_PASSWORD=<postgres-password>

# Optional:
REDIS_HOST=<redis-host>
REDIS_PORT=6379
ENABLE_CLAUDE_AI=false
```

---

## Testing Locally

To test the fixes locally before deploying:

```bash
# 1. Build the project
cd backend
npm install
npm run build

# 2. Test production start
NODE_ENV=production PORT=3001 node dist/index.js

# Expected output:
# ✓ NeuroOps API server running on http://0.0.0.0:3001
# ✓ Environment: production
# ✓ Server ready to accept requests
```

---

## Verification Checklist

- [x] `railway.toml` created with build & start commands
- [x] `backend/package.json` includes `postinstall` build script
- [x] `backend/src/config/index.ts` reads `process.env.PORT`
- [x] `backend/src/config/index.ts` sets `API_HOST` to `0.0.0.0` in production
- [x] Build process verified locally
- [x] Documentation created

---

## Impact Summary

| Issue | Severity | Fix | Result |
|-------|----------|-----|--------|
| dist/ missing | 🔴 Critical | Added auto-build | TypeScript compiles |
| Port not read | 🔴 Critical | Read process.env.PORT | App starts on Railway port |
| localhost binding | 🔴 Critical | Bind to 0.0.0.0 | Accepts remote connections |
| No automation | 🟠 High | Added postinstall | One-shot build |

---

## Deployment Instructions

### Quick Deploy
```bash
# Push to GitHub
git add .
git commit -m "Fix Railway deployment: Add build process, port config"
git push origin main

# In Railway Dashboard:
# 1. New Project → Deploy from GitHub
# 2. Select NeuroOps repo
# 3. Add environment variables
# 4. Deploy!
```

### Verify Deployment
```bash
# Test health endpoint
curl https://<your-app>.railway.app/health

# Check logs
railway logs -f
```

---

## Rollout Plan

**Phase 1 - Local Testing** (Do this first):
```bash
cd backend
npm install
npm run build
NODE_ENV=production PORT=3001 node dist/index.js
```
✓ If this works, proceed to Phase 2

**Phase 2 - Railway Test Deployment**:
1. Deploy to Railway staging/preview
2. Test health endpoint
3. Verify database connectivity

**Phase 3 - Production**:
1. Enable automatic deployments from main branch
2. Monitor logs for errors
3. Check metrics endpoint

---

## Technical Details

### Build Process
```
railway.toml:
  buildCommand = "cd backend && npm install && npm run build"

↓ Executes:
  1. npm install (installs all dependencies)
  2. npm run build (runs: tsc - TypeScript Compiler)

↓ Result:
  TypeScript source → JavaScript output
  src/server.ts → dist/server.js
  src/index.ts → dist/index.js
  src/config/ → dist/config/
  [all .ts files] → [corresponding .js files]
```

### Start Process
```
railway.toml:
  cmd = "cd backend && node dist/index.js"

↓ Executes:
  node backend/dist/index.js

↓ Which runs:
  import { startServer } from './server';
  startServer();

↓ Which:
  1. Creates Express app
  2. Test database connection (non-blocking)
  3. Test Redis connection (non-blocking)
  4. Start background workers
  5. app.listen(PORT, '0.0.0.0')
  6. Logs: "✓ Server running on http://0.0.0.0:PORT"
```

---

## Troubleshooting

### Build Still Fails?
1. Check for TypeScript errors:
   ```bash
   cd backend
   npm run lint
   npm run tsc --noEmit
   ```

2. Check dependencies installed:
   ```bash
   ls backend/node_modules/@types/
   ```

3. Check tsconfig.json is valid:
   ```bash
   cat backend/tsconfig.json | jq .
   ```

### Server Won't Start?
1. Check dist/ folder exists:
   ```bash
   ls backend/dist/
   ```

2. Test the exact command:
   ```bash
   cd backend && node dist/index.js
   ```

3. Check environment variables:
   ```bash
   echo $PORT
   echo $NODE_ENV
   echo $API_HOST
   ```

### Database Connection Fails?
1. Verify credentials:
   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/db psql
   ```

2. Enable SSL:
   ```env
   DB_SSL=true
   ```

3. Check Railway network:
   - PostgreSQL service in same Railway project
   - Environment variables linked

---

## Deployment Success Indicators

After deploying to Railway, you should see:

**In Logs:**
```
✓ NeuroOps API server running on http://0.0.0.0:3001
✓ Environment: production
✓ Server ready to accept requests
```

**Health Endpoint Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-28T12:34:56.789Z",
  "version": "2.5.0",
  "services": {
    "database": true,
    "redis": true
  }
}
```

**No Errors in Railway Logs**

---

## What Wasn't Changed (Intentionally)

- ✅ Application logic remains unchanged
- ✅ API endpoints unchanged
- ✅ Database schema unchanged
- ✅ Frontend unchanged
- ✅ All features preserved

---

## References

- [Railway Docs](https://docs.railway.app)
- [railway.toml Configuration](https://docs.railway.app/reference/railway-toml)
- [Environment Variables](https://docs.railway.app/guides/environment-variables)
- [Deployment Logs](https://docs.railway.app/guides/logs)

---

**Status**: ✅ READY FOR DEPLOYMENT

All fixes implemented and tested!
