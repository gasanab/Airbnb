# 🎉 Airbnb API - Ready for Testing!

## ✅ Setup Complete

Your Airbnb API is now fully configured and ready for testing with Postman. All test data has been created successfully.

## 👥 Test User Credentials

| Role | Email | Password | User ID | Purpose |
|------|-------|----------|---------|---------|
| **HOST** | `host@test.com` | `password123` | Auto-assigned | Create/manage listings & photos |
| **GUEST** | `guest@test.com` | `password123` | Auto-assigned | Create/manage bookings |
| **ADMIN** | `admin@test.com` | `password123` | Auto-assigned | Full system access |
| **HOST** | `sarah@test.com` | `password123` | Auto-assigned | Additional host for testing |

## 🏠 Test Listings Created

4 sample listings have been created:
1. **Cozy Beach House** - Malibu, CA ($250/night)
2. **Downtown Luxury Apartment** - New York, NY ($180/night)
3. **Mountain Cabin Retreat** - Aspen, CO ($200/night)
4. **Luxury Villa with Pool** - Miami, FL ($350/night)

## 📁 Postman Files

Import these files into Postman:

1. **Collection**: `Airbnb-API.postman_collection.json`
   - Contains all API endpoints with examples
   - Automatic token management
   - Environment variable integration

2. **Environment**: `Airbnb-Test-Environment.postman_environment.json`
   - Pre-configured with test credentials
   - Automatic variable updates
   - Base URL and user IDs

## 🚀 Quick Start Testing

### 1. Start the Server
```bash
npm run dev
```

### 2. Import Postman Files
- Import both JSON files into Postman
- Select "Airbnb Test Environment"

### 3. Test Authentication
1. Use "Login as HOST" request
2. Token will be automatically saved
3. Use "Get Profile" to verify login

### 4. Test Core Features
- **Listings**: Create, view, update (HOST only)
- **Bookings**: Create, cancel (GUEST only)
- **File Upload**: Avatar and listing photos
- **Admin**: Full access to all resources

## 🧪 Key Test Scenarios

### Authentication Tests ✅
- [x] Register new users (HOST/GUEST only)
- [x] Login with different roles
- [x] Access protected endpoints
- [x] Role-based authorization (403 errors)

### Listing Management ✅
- [x] View public listings (no auth)
- [x] Create listings (HOST only)
- [x] Update own listings (ownership check)
- [x] Upload listing photos (max 5)

### Booking System ✅
- [x] Create bookings (GUEST only)
- [x] Date validation (future dates, valid ranges)
- [x] Conflict detection (overlapping bookings)
- [x] Cancel own bookings
- [x] Email notifications

### File Upload ✅
- [x] Avatar upload/delete
- [x] Listing photo management
- [x] File type validation (images only)
- [x] Size limits (5MB max)
- [x] Ownership validation

## 📧 Email Testing

To test email notifications, update your `.env` with real Gmail credentials:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

**Email triggers:**
- Registration → Welcome email
- Booking creation → Confirmation email
- Booking cancellation → Cancellation email
- Password reset → Reset link email

## 🔍 Expected API Responses

### Successful Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Host",
    "email": "host@test.com",
    "role": "HOST",
    ...
  }
}
```

### Successful Booking Creation
```json
{
  "id": 1,
  "guestId": 2,
  "listingId": 1,
  "checkIn": "2024-07-01T00:00:00.000Z",
  "checkOut": "2024-07-05T00:00:00.000Z",
  "totalPrice": 1000,
  "status": "PENDING"
}
```

## 🚨 Common Error Responses

### 401 Unauthorized
```json
{
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "message": "Only hosts can perform this action"
}
```

### 409 Conflict (Booking)
```json
{
  "message": "Listing is not available for the selected dates"
}
```

## 📊 Testing Checklist

### Basic Functionality
- [ ] Server starts without errors
- [ ] Database connection works
- [ ] All endpoints respond correctly
- [ ] Authentication flow works

### Security Features
- [ ] JWT tokens work properly
- [ ] Role-based access control
- [ ] Ownership validation
- [ ] Password hashing
- [ ] File upload security

### Business Logic
- [ ] Booking date validation
- [ ] Conflict detection
- [ ] Price calculation
- [ ] Email notifications
- [ ] File management

### Error Handling
- [ ] Proper HTTP status codes
- [ ] Validation error messages
- [ ] Graceful failure handling
- [ ] Security error responses

## 🎯 Success Indicators

Your API is working correctly if:

✅ **Authentication**: All login/logout flows work  
✅ **Authorization**: Role restrictions are enforced  
✅ **Bookings**: Date validation and conflicts work  
✅ **Files**: Upload/delete operations succeed  
✅ **Emails**: Notifications are sent properly  
✅ **Security**: Unauthorized access is blocked  

## 📞 Support

If you encounter issues:

1. **Check server logs** for error details
2. **Verify environment variables** in `.env`
3. **Ensure database is running** and accessible
4. **Check Postman console** for request/response details
5. **Review the testing guide** for detailed instructions

## 🎉 You're All Set!

Your Airbnb API implementation is complete and ready for comprehensive testing. The system includes:

- ✅ Full authentication & authorization
- ✅ Email notification system
- ✅ File upload with Cloudinary
- ✅ Comprehensive validation
- ✅ Security best practices
- ✅ Complete test suite

Happy testing! 🚀