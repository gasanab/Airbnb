# Postman Testing Guide for Airbnb API

## 🚀 Quick Setup

### 1. Create Test Data
First, make sure your server is running and create test users and listings:

```bash
# Start the server
npm run dev

# In another terminal, create test data
node create-test-data.js
```

### 2. Import Postman Files
1. **Import Collection**: Import `Airbnb-API.postman_collection.json`
2. **Import Environment**: Import `Airbnb-Test-Environment.postman_environment.json`
3. **Select Environment**: Make sure "Airbnb Test Environment" is selected in Postman

## 👥 Test User Credentials

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| HOST | `host@test.com` | `password123` | Create/manage listings, upload photos |
| GUEST | `guest@test.com` | `password123` | Create/manage bookings |
| ADMIN | `admin@test.com` | `password123` | Full system access |
| HOST | `sarah@test.com` | `password123` | Additional host for testing |

## 🧪 Testing Workflow

### Step 1: Authentication Testing

1. **Register New User** (optional)
   - Use the "Register User" request
   - Try different roles (HOST/GUEST)
   - Note: ADMIN role cannot be self-assigned

2. **Login as HOST**
   - Use "Login as HOST" request
   - Token will be automatically saved to environment
   - User ID will be saved for avatar uploads

3. **Get Profile**
   - Use "Get Profile" request
   - Should return user info with listings (for HOST)

### Step 2: Listings Management (HOST Required)

1. **View All Listings**
   - Use "Get All Listings" (no auth required)
   - Should show existing test listings

2. **Create New Listing** (HOST only)
   - Use "Create Listing (HOST only)"
   - Must be logged in as HOST
   - Try with GUEST login - should get 403 error

3. **Update Listing** (Owner only)
   - Use "Update Listing"
   - Only the listing owner can update
   - ADMIN can update any listing

4. **Upload Listing Photos** (Owner only)
   - Use "Upload Listing Photos"
   - Select 1-5 image files
   - Only listing owner can upload

### Step 3: Booking Management (GUEST Required)

1. **Login as GUEST**
   - Use "Login as GUEST" request
   - Token will be automatically updated

2. **Create Booking** (GUEST only)
   - Use "Create Booking (GUEST only)"
   - Must be logged in as GUEST
   - Booking ID will be saved automatically
   - Should receive confirmation email

3. **View Booking**
   - Use "Get Booking by ID"
   - Uses the saved booking ID

4. **Cancel Booking** (Owner only)
   - Use "Cancel Booking"
   - Only booking owner can cancel
   - Should receive cancellation email

### Step 4: File Upload Testing

1. **Upload Avatar**
   - Login as any user
   - Use "Upload Avatar"
   - Select an image file (JPG, PNG, WebP)
   - Max 5MB file size

2. **Upload Listing Photos**
   - Login as HOST
   - Use "Upload Listing Photos"
   - Select multiple image files (max 5)
   - Only works for listing owners

### Step 5: Admin Testing

1. **Login as ADMIN**
   - Use "Login as ADMIN" request

2. **Access Admin Endpoints**
   - Try updating any listing (should work)
   - Try canceling any booking (should work)
   - Access user management endpoints

## 🔍 Testing Scenarios

### Authentication & Authorization

| Test Case | Expected Result |
|-----------|----------------|
| Register with ADMIN role | 403 Forbidden |
| Login with wrong password | 401 Unauthorized |
| Access protected route without token | 401 Unauthorized |
| HOST tries to create booking | 403 Forbidden |
| GUEST tries to create listing | 403 Forbidden |
| User tries to update others' resources | 403 Forbidden |

### Booking Validation

| Test Case | Expected Result |
|-----------|----------------|
| Check-in date in the past | 400 Bad Request |
| Check-out before check-in | 400 Bad Request |
| Overlapping booking dates | 409 Conflict |
| Valid booking | 201 Created + Email |

### File Upload Validation

| Test Case | Expected Result |
|-----------|----------------|
| Upload non-image file | 400 Bad Request |
| Upload file > 5MB | 400 Bad Request |
| Upload to others' listing | 403 Forbidden |
| Valid image upload | 200 OK |

## 📧 Email Testing

To test emails, configure your `.env` file with real email credentials:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Airbnb <your-email@gmail.com>
```

**Email Triggers:**
- Registration → Welcome email
- Booking creation → Confirmation email
- Booking cancellation → Cancellation email
- Password reset → Reset link email

## 🐛 Common Issues & Solutions

### Issue: "JWT_SECRET is not configured"
**Solution**: Make sure `.env` file has `JWT_SECRET` set

### Issue: "Database connection error"
**Solution**: Check `DATABASE_URL` in `.env` and ensure PostgreSQL is running

### Issue: "User not found" on login
**Solution**: Run `node create-test-data.js` to create test users

### Issue: File upload fails
**Solution**: Check Cloudinary credentials in `.env` file

### Issue: Emails not sending
**Solution**: Configure Gmail app password in `.env` file

## 📊 Environment Variables Reference

The Postman environment includes these variables:

- `baseUrl`: API base URL (http://localhost:3000)
- `token`: JWT token (auto-updated on login)
- `userId`: Current user ID (auto-updated on login)
- `hostEmail`: HOST user email (host@test.com)
- `guestEmail`: GUEST user email (guest@test.com)
- `adminEmail`: ADMIN user email (admin@test.com)
- `listingId`: Test listing ID (1)
- `bookingId`: Created booking ID (auto-updated)

## 🎯 Success Criteria

Your API is working correctly if:

✅ All authentication endpoints return proper status codes  
✅ Role-based access control works (403 for wrong roles)  
✅ File uploads work with proper validation  
✅ Booking conflicts are detected  
✅ Emails are sent for user actions  
✅ Ownership validation prevents unauthorized access  
✅ Password reset flow works end-to-end  

## 📝 Notes

- Always check the Postman Console for automatic variable updates
- Use the environment variables instead of hardcoded IDs
- Test both success and failure scenarios
- Verify email notifications in your inbox
- Check server logs for any errors during testing