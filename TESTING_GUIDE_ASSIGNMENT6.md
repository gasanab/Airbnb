# Testing Guide - Assignment 6: Performance Optimization

## 🚀 Quick Start Testing

### 1. Start the Development Server

```bash
npm run dev
```

You should see:
```
🚀 Server is running on http://localhost:3000
📚 API Documentation: http://localhost:3000/api-docs
⚡ Performance optimizations enabled:
   - Compression: ✅
   - Rate Limiting: ✅
   - Connection Pooling: ✅
   - Caching: ✅
```

### 2. Access Swagger UI

Open in browser: **http://localhost:3000/api-docs**

All endpoints are documented with examples and test buttons.

---

## 📋 Testing Checklist

### A. Authentication (Required for all tests)

#### 1. Register a User
```
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "username": "testuser",
  "phone": "1234567890",
  "password": "password123",
  "role": "GUEST"
}
```

**Expected Response (201):**
```json
{
  "id": 1,
  "name": "Test User",
  "email": "test@example.com",
  "username": "testuser",
  "role": "GUEST",
  "createdAt": "2024-04-30T10:00:00.000Z"
}
```

#### 2. Login
```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "GUEST"
  }
}
```

**Save the token for all subsequent requests!**

---

### B. Search & Filtering Tests

#### Test 1: Basic Search by Location
```
GET http://localhost:3000/api/v1/listings/search?location=New York
```

**Expected:** Returns listings in New York with pagination metadata

#### Test 2: Filter by Price Range
```
GET http://localhost:3000/api/v1/listings/search?minPrice=100&maxPrice=300
```

**Expected:** Returns listings between $100-$300 per night

#### Test 3: Filter by Type
```
GET http://localhost:3000/api/v1/listings/search?type=APARTMENT
```

**Expected:** Returns only apartment listings

#### Test 4: Combined Filters
```
GET http://localhost:3000/api/v1/listings/search?location=New York&type=APARTMENT&minPrice=100&maxPrice=300&guests=2&page=1&limit=5
```

**Expected:** Returns filtered listings with pagination

#### Test 5: Pagination
```
GET http://localhost:3000/api/v1/listings/search?page=1&limit=3
GET http://localhost:3000/api/v1/listings/search?page=2&limit=3
```

**Expected:** Returns different results for each page

---

### C. Bookings Tests

#### Test 1: Create a Booking
```
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "listingId": 1,
  "checkIn": "2024-06-15",
  "checkOut": "2024-06-20",
  "guests": 2
}
```

**Expected Response (201):**
```json
{
  "id": 1,
  "listingId": 1,
  "guestId": 1,
  "checkIn": "2024-06-15T00:00:00.000Z",
  "checkOut": "2024-06-20T00:00:00.000Z",
  "guests": 2,
  "totalPrice": 750,
  "status": "PENDING"
}
```

#### Test 2: Booking Conflict Detection
```
POST http://localhost:3000/api/v1/bookings
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "listingId": 1,
  "checkIn": "2024-06-16",
  "checkOut": "2024-06-19",
  "guests": 2
}
```

**Expected Response (409):**
```json
{
  "message": "Listing is not available for the selected dates"
}
```

#### Test 3: Get All Bookings (Paginated)
```
GET http://localhost:3000/api/v1/bookings?page=1&limit=10
```

**Expected:** Returns paginated bookings with metadata

#### Test 4: Get User's Bookings
```
GET http://localhost:3000/api/v1/users/1/bookings?page=1&limit=10
Authorization: Bearer <your-token>
```

**Expected:** Returns only that user's bookings

#### Test 5: Get Booking Details
```
GET http://localhost:3000/api/v1/bookings/1
```

**Expected:** Returns full booking details with guest and listing info

#### Test 6: Cancel Booking
```
DELETE http://localhost:3000/api/v1/bookings/1
Authorization: Bearer <your-token>
```

**Expected Response (200):**
```json
{
  "message": "Booking cancelled successfully"
}
```

---

### D. Reviews Tests

#### Test 1: Add a Review
```
POST http://localhost:3000/api/v1/listings/1/reviews
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Amazing place! Perfect location and very clean."
}
```

**Expected Response (201):**
```json
{
  "id": 1,
  "rating": 5,
  "comment": "Amazing place! Perfect location and very clean.",
  "userId": 1,
  "listingId": 1,
  "user": {
    "id": 1,
    "name": "Test User",
    "avatar": null
  },
  "createdAt": "2024-04-30T10:00:00.000Z"
}
```

#### Test 2: Invalid Rating (Should Fail)
```
POST http://localhost:3000/api/v1/listings/1/reviews
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "rating": 6,
  "comment": "Invalid rating"
}
```

**Expected Response (400):**
```json
{
  "message": "Rating must be between 1 and 5"
}
```

#### Test 3: Get Reviews (First Call - Hits Database)
```
GET http://localhost:3000/api/v1/listings/1/reviews?page=1&limit=10
```

**Expected:** Returns paginated reviews with reviewer info
**Performance:** ~200ms (database query)

#### Test 4: Get Reviews (Second Call - From Cache)
```
GET http://localhost:3000/api/v1/listings/1/reviews?page=1&limit=10
```

**Expected:** Same results as Test 3
**Performance:** ~10ms (from cache)

#### Test 5: Delete Review
```
DELETE http://localhost:3000/api/v1/reviews/1
Authorization: Bearer <your-token>
```

**Expected Response (200):**
```json
{
  "message": "Review deleted successfully"
}
```

---

### E. Statistics Tests

#### Test 1: Get Listing Statistics (First Call)
```
GET http://localhost:3000/api/v1/stats/listings
```

**Expected Response (200):**
```json
{
  "totalListings": 4,
  "averagePrice": 242.5,
  "byLocation": [
    {
      "location": "New York",
      "_count": { "location": 1 }
    },
    {
      "location": "Los Angeles",
      "_count": { "location": 1 }
    }
  ],
  "byType": [
    {
      "type": "APARTMENT",
      "_count": { "type": 1 }
    }
  ]
}
```

**Performance:** ~300ms (parallel queries)

#### Test 2: Get Listing Statistics (Second Call - Cached)
```
GET http://localhost:3000/api/v1/stats/listings
```

**Expected:** Same results as Test 1
**Performance:** ~10ms (from 5-minute cache)

#### Test 3: Get User Statistics
```
GET http://localhost:3000/api/v1/stats/users
```

**Expected Response (200):**
```json
{
  "totalUsers": 5,
  "byRole": [
    {
      "role": "GUEST",
      "_count": { "role": 3 }
    },
    {
      "role": "HOST",
      "_count": { "role": 2 }
    }
  ]
}
```

---

### F. Rate Limiting Tests

#### Test 1: General Rate Limit (100 requests per 15 minutes)
```bash
# Send 101 requests quickly
for i in {1..101}; do
  curl http://localhost:3000/api/v1/listings
done
```

**Expected:** 101st request returns 429 Too Many Requests

#### Test 2: Strict Rate Limit (20 POST requests per 15 minutes)
```bash
# Send 21 POST requests quickly
for i in {1..21}; do
  curl -X POST http://localhost:3000/api/v1/bookings \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"listingId":1,"checkIn":"2024-06-15","checkOut":"2024-06-20","guests":2}'
done
```

**Expected:** 21st request returns 429 Too Many Requests

#### Test 3: Rate Limit Response
```
HTTP/1.1 429 Too Many Requests

{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": "15 minutes"
}
```

---

### G. Compression Tests

#### Test 1: Check Response Headers
```bash
curl -i http://localhost:3000/api/v1/listings
```

**Expected Headers:**
```
Content-Encoding: gzip
Content-Type: application/json
```

#### Test 2: Compare Response Sizes
```bash
# Without compression (simulated)
curl http://localhost:3000/api/v1/listings | wc -c

# With compression (actual)
curl --compressed http://localhost:3000/api/v1/listings | wc -c
```

**Expected:** Compressed response is 60-80% smaller

---

### H. Cache Invalidation Tests

#### Test 1: Create Listing and Verify Cache Invalidation
```
1. GET /api/v1/listings/search?location=NYC (caches result)
2. POST /api/v1/listings (creates new listing)
3. GET /api/v1/listings/search?location=NYC (should show new listing)
```

**Expected:** New listing appears in search results

#### Test 2: Update Listing and Verify Cache Invalidation
```
1. GET /api/v1/listings/1 (caches result)
2. PUT /api/v1/listings/1 (updates listing)
3. GET /api/v1/listings/1 (should show updated data)
```

**Expected:** Updated data is returned

---

## 🧪 Postman Collection

### Import the Collection

1. Open Postman
2. Click **Import**
3. Select **Airbnb-API.postman_collection.json**
4. Import the **Airbnb-Test-Environment.postman_environment.json**

### Run Tests

1. Select the environment: **Airbnb-Test-Environment**
2. Run the collection with **Collection Runner**
3. All tests should pass ✅

---

## 📊 Performance Benchmarks

### Expected Response Times

| Endpoint | First Call | Cached Call | Improvement |
|----------|-----------|------------|-------------|
| `/listings/search` | 200ms | 10ms | 20x faster |
| `/listings/:id/reviews` | 150ms | 8ms | 18x faster |
| `/stats/listings` | 300ms | 12ms | 25x faster |
| `/stats/users` | 250ms | 10ms | 25x faster |
| `/bookings` | 180ms | 9ms | 20x faster |

### Cache Hit Rates

- **Search Results**: 80-90% cache hit rate
- **Reviews**: 85-95% cache hit rate
- **Statistics**: 90-95% cache hit rate

---

## 🐛 Troubleshooting

### Issue: "Too many requests" error immediately
**Solution:** Rate limiter is working correctly. Wait 15 minutes or restart the server.

### Issue: Cache not working
**Solution:** Check that caching middleware is enabled in `src/index.ts`

### Issue: Booking conflict not detected
**Solution:** Ensure transaction is being used in `createBooking` controller

### Issue: Reviews not updating listing rating
**Solution:** Check that `updateListing` is called after review creation

### Issue: Compression not working
**Solution:** Verify `compression()` middleware is applied before routes in `src/index.ts`

---

## ✅ Final Verification Checklist

- [ ] Server starts without errors
- [ ] Swagger UI loads at `/api-docs`
- [ ] Can register and login
- [ ] Search filters work correctly
- [ ] Bookings can be created and cancelled
- [ ] Reviews can be added and deleted
- [ ] Statistics endpoints return aggregated data
- [ ] Caching improves response times
- [ ] Rate limiting blocks excessive requests
- [ ] Compression reduces response size
- [ ] All endpoints return proper pagination metadata

**All tests passing? 🎉 Assignment 6 is complete!**