# 🚀 Quick Start Guide

## Get Your API Running in 5 Minutes!

### Step 1: Install Dependencies (if not done)

```bash
npm install
```

### Step 2: Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with test data
npm run db:seed
```

### Step 3: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
🚀 Server is running on http://localhost:3000
📚 API Documentation: http://localhost:3000/api-docs
🏥 Health Check: http://localhost:3000/health
📍 API Version: v1 at /api/v1
⚡ Performance optimizations enabled:
   - Compression: ✅
   - Rate Limiting: ✅
   - Connection Pooling: ✅
   - Caching: ✅
   - Logging: ✅
```

### Step 4: Test the API

#### Option A: Use Swagger UI (Easiest)
1. Open browser: `http://localhost:3000/api-docs`
2. Click on any endpoint
3. Click "Try it out"
4. Fill in parameters
5. Click "Execute"

#### Option B: Use Postman
1. Import `Airbnb-API.postman_collection.json`
2. Import `Airbnb-Test-Environment.postman_environment.json`
3. Run the collection

#### Option C: Use cURL

**Register a User:**
```bash
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

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Listings:**
```bash
curl http://localhost:3000/api/v1/listings
```

**Search Listings:**
```bash
curl "http://localhost:3000/api/v1/listings/search?location=New York&type=APARTMENT"
```

---

## 🎯 Test Data Available

The seed script creates:

### Users (password: `password123`)
- **alice@example.com** (HOST)
- **bob@example.com** (HOST)
- **charlie@example.com** (GUEST)
- **diana@example.com** (GUEST)
- **eve@example.com** (GUEST)

### Listings
- Modern Downtown Apartment (New York) - $150/night
- Cozy Family House (Los Angeles) - $200/night
- Luxury Beachfront Villa (Miami) - $500/night
- Mountain Retreat Cabin (Colorado) - $120/night

### Bookings
- 3 confirmed/pending bookings with future dates

### Reviews
- 4 reviews with ratings 4-5 stars

---

## 📚 Key Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Listings
- `GET /api/v1/listings` - Get all listings (paginated)
- `GET /api/v1/listings/search` - Search with filters
- `GET /api/v1/listings/:id` - Get single listing
- `POST /api/v1/listings` - Create listing (HOST only)

### Bookings
- `GET /api/v1/bookings` - Get all bookings (paginated)
- `POST /api/v1/bookings` - Create booking (GUEST only)
- `GET /api/v1/users/:id/bookings` - Get user's bookings
- `DELETE /api/v1/bookings/:id` - Cancel booking

### Reviews
- `GET /api/v1/listings/:id/reviews` - Get listing reviews
- `POST /api/v1/listings/:id/reviews` - Add review
- `DELETE /api/v1/reviews/:id` - Delete review

### Statistics
- `GET /api/v1/stats/listings` - Listing statistics
- `GET /api/v1/stats/users` - User statistics

### Health
- `GET /health` - Health check

---

## 🔧 Useful Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Database
npm run db:studio        # Open Prisma Studio (database GUI)
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database (wipe + migrate + seed)
npm run db:push          # Push schema changes to database
npm run db:generate      # Generate Prisma client

# Production
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server
```

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process or change PORT in .env
```

### Database connection error
```bash
# Check DATABASE_URL in .env
# Make sure PostgreSQL is running
# Try: npm run db:push
```

### "Module not found" error
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Prisma client out of sync
```bash
# Regenerate Prisma client
npm run db:generate
```

---

## 📖 Full Documentation

- **Testing Guide:** `TESTING_GUIDE_ASSIGNMENT6.md`
- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **Complete Summary:** `ASSIGNMENTS_COMPLETE.md`
- **Performance Details:** `PERFORMANCE_OPTIMIZATION_SUMMARY.md`

---

## ✅ You're Ready!

Your API is now running with:
- ✅ UUID-based IDs
- ✅ API Versioning (v1)
- ✅ Performance Optimizations
- ✅ Rate Limiting
- ✅ Caching
- ✅ Compression
- ✅ Full Documentation

**Happy coding! 🎉**
