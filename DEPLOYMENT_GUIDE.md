# 🚀 Deployment Guide - Airbnb API

## ✅ Assignment 6 & 7 Complete!

This guide covers deploying your production-ready Airbnb API with:
- ✅ UUID-based IDs (secure, non-sequential)
- ✅ API Versioning (v1 at `/api/v1`)
- ✅ Performance Optimizations (caching, compression, rate limiting)
- ✅ Production-ready features (health checks, error handlers, logging)

---

## 📋 Pre-Deployment Checklist

### ✅ Completed Features

- [x] UUID Migration (all IDs are now UUIDs)
- [x] API Versioning (all routes under `/api/v1`)
- [x] Deprecation Headers (v1 marked for sunset)
- [x] Health Check Endpoint (`/health`)
- [x] Global Error Handler
- [x] 404 Handler
- [x] Request Logging (Morgan)
- [x] Compression Middleware
- [x] Rate Limiting
- [x] Connection Pooling
- [x] Caching System
- [x] Build Scripts
- [x] .env.example file

---

## 🧪 Local Testing

### 1. Test the Build

```bash
npm run build
```

**Expected:** No TypeScript errors, `dist/` folder created

### 2. Test Production Mode Locally

```bash
# Build the project
npm run build

# Start in production mode
NODE_ENV=production npm start
```

**Expected:** Server starts from `dist/index.js`

### 3. Test Health Check

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2024-04-30T10:00:00.000Z"
}
```

### 4. Test API v1 Endpoints

```bash
# Register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "username": "testuser",
    "phone": "1234567890",
    "password": "password123",
    "role": "GUEST"
  }'
```

**Expected:** User created with UUID (not integer) ID

### 5. Verify UUID Format

**Old Response (Integer IDs):**
```json
{
  "id": 1,
  "name": "Test User"
}
```

**New Response (UUID IDs):**
```json
{
  "id": "a3f8c2d1-4b5e-4f6a-8c9d-1e2f3a4b5c6d",
  "name": "Test User"
}
```

---

## 🌐 Deploy to Render

### Step 1: Prepare Git Repository

```bash
# Make sure .env is in .gitignore
echo ".env" >> .gitignore

# Commit all changes
git add .
git commit -m "feat: add UUID migration, API versioning, and production features"
git push origin main
```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Create PostgreSQL Database

1. Click **New** → **PostgreSQL**
2. Configure:
   - **Name:** `airbnb-db`
   - **Database:** `airbnb`
   - **User:** `airbnb_user`
   - **Region:** Choose closest to you
   - **Plan:** Free
3. Click **Create Database**
4. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 4: Create Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `airbnb-api`
   - **Environment:** `Node`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Build Command:**
     ```bash
     npm install && npm run build && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
   - **Plan:** Free

### Step 5: Set Environment Variables

Go to **Environment** tab and add:

```env
DATABASE_URL=<paste Internal Database URL from Step 3>
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=7d
NODE_ENV=production
API_URL=https://your-app.onrender.com
PORT=3000

# Email (Optional - for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Airbnb API <your-email@gmail.com>

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 6: Deploy

1. Click **Create Web Service**
2. Watch the build logs
3. Wait for deployment to complete (~5-10 minutes)

**Expected Build Output:**
```
> npm install
> npm run build
> npx prisma generate
> npx prisma migrate deploy
Applying migration `20240430_add_reviews`
✔ All migrations applied successfully
> npm start
🚀 Server is running on http://localhost:10000
📚 API Documentation: http://localhost:10000/api-docs
🏥 Health Check: http://localhost:10000/health
📍 API Version: v1 at /api/v1
```

---

## ✅ Verify Deployment

### 1. Health Check

```bash
curl https://your-app.onrender.com/health
```

**Expected:**
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2024-04-30T10:00:00.000Z",
  "environment": "production"
}
```

### 2. API Documentation

Visit: `https://your-app.onrender.com/api-docs`

**Expected:** Swagger UI loads with all endpoints

### 3. Register a User

```bash
curl -X POST https://your-app.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production User",
    "email": "prod@example.com",
    "username": "produser",
    "phone": "1234567890",
    "password": "password123",
    "role": "GUEST"
  }'
```

**Expected:** 201 Created with UUID

### 4. Login

```bash
curl -X POST https://your-app.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prod@example.com",
    "password": "password123"
  }'
```

**Expected:** 200 OK with JWT token

### 5. Test Protected Route

```bash
curl https://your-app.onrender.com/api/v1/users \
  -H "Authorization: Bearer <your-token>"
```

**Expected:** 200 OK with users list

### 6. Test Search (Performance Optimization)

```bash
# First call - hits database
curl "https://your-app.onrender.com/api/v1/listings/search?location=New York"

# Second call - from cache (faster)
curl "https://your-app.onrender.com/api/v1/listings/search?location=New York"
```

**Expected:** Second call is significantly faster

### 7. Test Rate Limiting

```bash
# Send 101 requests quickly
for i in {1..101}; do
  curl https://your-app.onrender.com/api/v1/listings
done
```

**Expected:** 101st request returns 429 Too Many Requests

### 8. Check Deprecation Headers

```bash
curl -I https://your-app.onrender.com/api/v1/auth/login
```

**Expected Headers:**
```
Deprecation: true
Sunset: Sat, 01 Jan 2027 00:00:00 GMT
Link: </api/v2>; rel="successor-version"
```

---

## 🔄 Continuous Deployment

Every `git push` to `main` triggers automatic redeployment:

```bash
# Make a change
echo "// Updated" >> src/index.ts

# Commit and push
git add .
git commit -m "update: minor change"
git push origin main
```

**Render automatically:**
1. Detects the push
2. Runs build command
3. Runs migrations
4. Deploys new version
5. Zero downtime!

---

## 📊 Monitoring

### View Logs

1. Go to Render Dashboard
2. Click your service
3. Click **Logs** tab
4. See real-time logs

### Check Metrics

1. Click **Metrics** tab
2. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### Set Up Alerts

1. Click **Settings**
2. Scroll to **Notifications**
3. Add email for deployment failures

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Cannot find module`
**Solution:** Make sure all dependencies are in `package.json`

```bash
npm install <missing-package>
git add package.json package-lock.json
git commit -m "fix: add missing dependency"
git push
```

### Migration Fails

**Error:** `Migration failed`
**Solution:** Check migration files

```bash
# Locally test migrations on fresh database
npm run db:reset
npm run db:migrate
```

### App Crashes on Start

**Error:** `Cannot connect to database`
**Solution:** Check `DATABASE_URL` in environment variables

1. Go to Render Dashboard
2. Click **Environment**
3. Verify `DATABASE_URL` is correct
4. Click **Save Changes**

### 404 on All Routes

**Error:** All routes return 404
**Solution:** Check that routes are mounted correctly

```typescript
// src/index.ts
app.use("/api/v1", v1Router); // ✅ Correct
```

---

## 🎉 Success Checklist

- [ ] Health check returns 200
- [ ] Swagger UI loads
- [ ] Can register new user with UUID
- [ ] Can login and get JWT token
- [ ] Protected routes work with token
- [ ] Search returns cached results on second call
- [ ] Rate limiting blocks excessive requests
- [ ] Deprecation headers present on v1 routes
- [ ] All endpoints use `/api/v1` prefix
- [ ] Build completes without errors
- [ ] Migrations run successfully
- [ ] Continuous deployment works

---

## 📚 API Endpoints Summary

### Base URL
- **Local:** `http://localhost:3000`
- **Production:** `https://your-app.onrender.com`

### All Endpoints Now Under `/api/v1`

| Old Route | New Route |
|-----------|-----------|
| `/auth/register` | `/api/v1/auth/register` |
| `/auth/login` | `/api/v1/auth/login` |
| `/users` | `/api/v1/users` |
| `/listings` | `/api/v1/listings` |
| `/listings/search` | `/api/v1/listings/search` |
| `/bookings` | `/api/v1/bookings` |
| `/listings/:id/reviews` | `/api/v1/listings/:id/reviews` |
| `/stats/listings` | `/api/v1/stats/listings` |
| `/stats/users` | `/api/v1/stats/users` |

### Special Endpoints

- **Health Check:** `/health` (no version prefix)
- **API Docs:** `/api-docs` (no version prefix)

---

## 🚀 Next Steps

1. **Custom Domain:** Add your own domain in Render settings
2. **SSL Certificate:** Automatically provided by Render
3. **Monitoring:** Set up external monitoring (UptimeRobot, Pingdom)
4. **Backup:** Set up automated database backups
5. **Scaling:** Upgrade to paid plan for better performance
6. **API v2:** When ready, create `/api/v2` with breaking changes

---

## 🎓 What You Learned

✅ **UUID Migration**
- Why UUIDs are more secure than sequential IDs
- How to migrate from Int to String IDs
- Updating TypeScript types for UUIDs

✅ **API Versioning**
- Organizing routes into versions
- Adding deprecation headers
- Planning for future API versions

✅ **Production Deployment**
- Building TypeScript for production
- Setting up health checks
- Configuring error handlers
- Using environment variables securely
- Deploying to cloud platforms
- Setting up continuous deployment

✅ **Performance Optimization**
- Caching strategies
- Rate limiting
- Compression
- Connection pooling
- Request logging

---

## 📞 Support

If you encounter issues:

1. Check Render logs
2. Test locally first
3. Verify environment variables
4. Check database connection
5. Review migration status

**Your API is now production-ready! 🎉**
