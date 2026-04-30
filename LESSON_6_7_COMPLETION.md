# Airbnb API - Lesson 6 & 7 Completion Report

## 🎯 Assignment Summary

Both Lesson 6 (Performance Optimization) and Lesson 7 (UUID Migration & Deployment Prep) have been **fully completed** and tested.

---

## ✅ Lesson 6: Performance Optimization

### 1. **Search & Filtering Endpoint** ✅
**Endpoint:** `GET /api/v1/listings/search`

**Features:**
- Dynamic filtering by location, type, minPrice, maxPrice, guests
- Pagination support (page, limit)
- Result caching for 60 seconds
- Parallel queries with Promise.all

**Query Parameters:**
```
location=NYC
type=APARTMENT
minPrice=50
maxPrice=300
guests=2
page=1
limit=10
```

**Response Format:**
```json
{
  "data": [...listings with host info and photos...],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### 2. **Bookings Endpoints** ✅
- `GET /api/v1/bookings` - List all bookings (paginated, cached 30s)
- `GET /api/v1/bookings/:id` - Get single booking with full details
- `GET /api/v1/users/:id/bookings` - User's bookings (paginated)
- `POST /api/v1/bookings` - Create booking with auto-calculated total
- `DELETE /api/v1/bookings/:id` - Cancel booking

**Key Features:**
- Automatic total calculation: `nights × pricePerNight`
- Date conflict detection using transactions
- Validation: checkOut > checkIn, future dates
- Email notifications on booking confirmation

### 3. **Reviews Endpoints** ✅
- `GET /api/v1/listings/:id/reviews` - Paginated reviews (cached 30s)
- `POST /api/v1/listings/:id/reviews` - Add review (1-5 rating)
- `DELETE /api/v1/reviews/:id` - Delete review (owner or admin only)

**Features:**
- Rating validation (1-5)
- Average rating calculation for listing
- Cache invalidation on new review
- Prevents duplicate reviews from same user

### 4. **Stats Endpoints** ✅
- `GET /api/v1/listings/stats` - Aggregated listing statistics
- `GET /api/v1/users/stats` - User count by role

**Sample Response:**
```json
{
  "totalListings": 120,
  "averagePrice": 145.50,
  "byLocation": [
    { "location": "New York", "_count": { "location": 30 } }
  ],
  "byType": [
    { "type": "APARTMENT", "_count": { "type": 45 } }
  ]
}
```

**Features:**
- All stats in single Promise.all call (no sequential queries)
- 5-minute cache with smart invalidation
- Grouped aggregations using Prisma groupBy

### 5. **Caching System** ✅
**File:** `src/config/cache.ts`

**Features:**
- In-memory cache with TTL (Time To Live)
- Methods: `getCache()`, `setCache()`, `deleteByPrefix()`
- Smart prefix-based cache invalidation
- Cache statistics tracking

**Cache Durations:**
- Search results: 60 seconds
- Reviews: 30 seconds
- Stats: 5 minutes
- Bookings: 30 seconds

### 6. **Rate Limiting** ✅
**File:** `src/middlewares/rateLimiter.ts`

**Applied Limiters:**
- General: 100 requests per 15 minutes (all routes)
- Strict: 20 POST requests per 15 minutes
- Auth: 5 authentication attempts per 15 minutes

**Returns:** 429 (Too Many Requests) when exceeded

### 7. **Pagination** ✅
All list endpoints support:
- `page` parameter (default: 1)
- `limit` parameter (default: 10, max: 100)
- Always returns meta object with total, page, limit, totalPages

### 8. **Database Optimization** ✅
**Indexes Applied:**
```sql
-- User
@@index([name])
@@index([role])

-- Listing
@@index([location])
@@index([pricePerNight])
@@index([type])
@@index([hostId])
@@index([type, location])  // composite
@@index([guests])

-- Booking & Review
@@index([userId])
@@index([listingId])
@@index([status])
```

### 9. **Connection Pooling** ✅
**File:** `src/config/prisma.ts`

```typescript
Pool Configuration:
- max: 10 connections
- idleTimeoutMillis: 30000 (30 seconds)
- connectionTimeoutMillis: 2000 (2 seconds)
```

### 10. **Compression** ✅
- Enabled via `compression` middleware
- Reduces response payload size
- Transparent to API consumers

---

## ✅ Lesson 7: UUID Migration & API Versioning

### 1. **UUID Migration** ✅
**What Changed:**
- All IDs migrated from `Int` to `String` with `@default(uuid())`
- Database migration: `20260430073524_change_ids_to_uuid`

**Updated Models:**
- User: id, listings, bookings, reviews
- Listing: id, hostId, bookings, photos, reviews
- Booking: id, guestId, listingId
- ListingPhoto: id, listingId
- Review: id, userId, listingId

**Code Updates:**
- Removed all `Number(req.params.id)` calls
- Updated `AuthRequest.userId` to `string`
- JWT payload: `userId: string` instead of `number`
- Fixed request body types for IDs

### 2. **API Versioning** ✅
**Routing Structure:**
```
All endpoints now prefixed with /api/v1/

Examples:
  POST /api/v1/auth/register
  GET /api/v1/listings/:id
  POST /api/v1/bookings
  GET /api/v1/listings/:id/reviews
  DELETE /api/v1/reviews/:id
  GET /api/v1/stats/listings
```

**Files:**
- `src/routes/v1/index.ts` - V1 router that combines all routes
- `src/middlewares/deprecation.middleware.ts` - Version deprecation headers

**Deprecation Headers (v1):**
```
Deprecation: true
Sunset: Sat, 01 Jan 2027 00:00:00 GMT
Link: </api/v2>; rel="successor-version"
```

### 3. **Production Readiness** ✅

**Health Check Endpoint:**
```
GET /health

Response:
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2026-04-30T12:34:56.789Z"
}
```

**Error Handlers:**
- Global error handler catches uncaught exceptions
- 404 handler for unknown routes
- Consistent error response format

**Request Logging:**
- Morgan middleware logs all requests
- Development: "dev" format (brief, colored)
- Production: "combined" format (detailed, Apache style)

**Environment Configuration:**
```
- PORT: Dynamic from process.env.PORT (default: 3000)
- NODE_ENV: Supports development/production
- All sensitive config in .env (not committed)
```

**Scripts in package.json:**
```json
{
  "dev": "nodemon --exec tsx src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "db:migrate": "prisma migrate dev",
  "db:migrate:prod": "prisma migrate deploy"
}
```

---

## 📊 API Response Examples

### Register User (UUID Response)
```bash
POST /api/v1/auth/register
{
  "name": "Alice",
  "email": "alice@gmail.com",
  "username": "alice123",
  "phone": "1234567890",
  "password": "password123",
  "role": "HOST"
}

Response (201):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",  // UUID
  "name": "Alice",
  "email": "alice@gmail.com",
  "username": "alice123",
  "role": "HOST",
  "createdAt": "2026-04-30T12:34:56.789Z"
}
```

### Create Booking
```bash
POST /api/v1/bookings
{
  "listingId": "123e4567-e89b-12d3-a456-426614174000",  // UUID
  "checkIn": "2026-05-15",
  "checkOut": "2026-05-18",
  "guests": 2
}

Response (201):
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "guestId": "550e8400-e29b-41d4-a716-446655440000",
  "listingId": "123e4567-e89b-12d3-a456-426614174000",
  "checkIn": "2026-05-15T00:00:00.000Z",
  "checkOut": "2026-05-18T00:00:00.000Z",
  "totalPrice": 360,  // 3 nights × 120/night
  "status": "PENDING",
  "createdAt": "2026-04-30T12:34:56.789Z"
}
```

---

## 🔍 Testing the API

### Quick Test Commands

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Register User:**
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

**Search Listings:**
```bash
curl "http://localhost:3000/api/v1/listings/search?location=NYC&type=APARTMENT&minPrice=50&maxPrice=300&page=1&limit=5"
```

**List Stats:**
```bash
curl http://localhost:3000/api/v1/stats/listings
```

**Rate Limiting Test:**
Send 101 rapid requests to see 429 response:
```bash
for i in {1..105}; do curl http://localhost:3000/health; done
```

---

## 🚀 Deployment Instructions

### For Railway/Render:

1. **Update package.json scripts** (already done):
   ```json
   "build": "tsc",
   "start": "node dist/index.js",
   "db:migrate:prod": "prisma migrate deploy"
   ```

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "UUID migration and API versioning complete"
   git push origin main
   ```

3. **Create Database on Platform:**
   - Create PostgreSQL database
   - Copy Internal Database URL

4. **Set Environment Variables:**
   ```
   DATABASE_URL=<internal-db-url>
   JWT_SECRET=<generate-random-string>
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   API_URL=https://your-app-name.onrender.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CLOUDINARY_CLOUD_NAME=your-cloud
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-secret
   ```

5. **Configure Build & Start:**
   - Build Command: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`

6. **Deploy:**
   - Click "Create Web Service"
   - Monitor build logs
   - Test at `https://your-app-name.onrender.com/health`

---

## 📁 File Changes Summary

**New Files Created:**
- `src/routes/v1/index.ts` - V1 router
- `src/middlewares/deprecation.middleware.ts` - Deprecation headers
- `.env.example` - Environment variables template
- `prisma/migrations/20260430073524_change_ids_to_uuid/` - UUID migration

**Modified Files:**
- `src/index.ts` - Updated with v1 routing and error handlers
- `src/middlewares/auth.middleware.ts` - Updated to use string userId
- `src/controllers/*.ts` - Removed parseInt() for all ID parsing
- `prisma/schema.prisma` - All IDs changed to UUID
- `package.json` - Added morgan dependency

**Unchanged (Already Complete):**
- Cache system (`src/config/cache.ts`)
- Rate limiting (`src/middlewares/rateLimiter.ts`)
- All controllers and endpoints
- Compression middleware

---

## ✨ Key Improvements

1. **Performance:** Caching, indexing, connection pooling reduce database load
2. **Security:** UUIDs prevent ID enumeration attacks
3. **Scalability:** API versioning allows future v2 development
4. **Reliability:** Error handlers and health checks enable monitoring
5. **Usability:** Clear pagination, filtering, and aggregation endpoints
6. **Maintenance:** Modular code structure with proper separation of concerns

---

## 📋 Verification Checklist

- ✅ Server starts without errors
- ✅ All routes accessible at `/api/v1/`
- ✅ Health check returns OK status
- ✅ UUIDs generated for new records
- ✅ Pagination works (page, limit parameters)
- ✅ Caching active (cached responses faster)
- ✅ Rate limiting enabled (429 on limit)
- ✅ Search/filtering functional
- ✅ Stats aggregations working
- ✅ Bookings calculations correct
- ✅ Reviews with cache invalidation
- ✅ Database migrations applied

---

## 🎓 Learning Outcomes

You've successfully implemented:
- Real-world API performance optimization techniques
- Database schema migration strategies
- API versioning patterns
- Production deployment preparation
- Error handling and logging
- Rate limiting and caching strategies
- Advanced database queries with Prisma

**Next Steps:** Deploy to Railway/Render for live testing!
