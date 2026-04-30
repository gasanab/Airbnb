# 🧪 Email & File Upload Testing Guide

## 🎯 Complete Testing Workflow

This guide will help you test both email notifications and file uploads to make sure everything works perfectly with your personal Gmail and Cloudinary accounts.

## 📧 Part 1: Email Testing

### Test 1: Welcome Email on Registration
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "your-test-email@gmail.com",
  "username": "testuser123",
  "phone": "+1234567890",
  "password": "password123",
  "role": "HOST"
}
```

**Expected Result:**
- ✅ 201 Created response
- ✅ Welcome email in your inbox
- ✅ Email has Airbnb branding (#FF5A5F color)
- ✅ Role-specific message (HOST gets "create listings" message)

### Test 2: Password Reset Email
```bash
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "your-test-email@gmail.com"
}
```

**Expected Result:**
- ✅ 200 OK response (always, even if email doesn't exist)
- ✅ Password reset email in your inbox
- ✅ Email contains reset link
- ✅ Link expires in 1 hour

### Test 3: Booking Confirmation Email
First create a booking as a GUEST:
```bash
POST /bookings
Authorization: Bearer GUEST_TOKEN
Content-Type: application/json

{
  "listingId": 1,
  "checkIn": "2024-07-01",
  "checkOut": "2024-07-05"
}
```

**Expected Result:**
- ✅ 201 Created response
- ✅ Booking confirmation email
- ✅ Email shows listing details, dates, total price
- ✅ Includes cancellation policy

### Test 4: Booking Cancellation Email
Cancel the booking:
```bash
DELETE /bookings/1
Authorization: Bearer GUEST_TOKEN
```

**Expected Result:**
- ✅ 200 OK response
- ✅ Cancellation email sent
- ✅ Email shows cancelled booking details
- ✅ Encourages finding another listing

## 📸 Part 2: File Upload Testing

### Test 5: Avatar Upload
```bash
POST /users/1/avatar
Authorization: Bearer USER_TOKEN
Content-Type: multipart/form-data

Form Data:
- image: [select JPG/PNG file under 5MB]
```

**Expected Result:**
- ✅ 200 OK response
- ✅ Response includes avatar URL
- ✅ Image appears in Cloudinary dashboard
- ✅ Old avatar deleted (if existed)

### Test 6: Listing Photos Upload
```bash
POST /listings/1/photos
Authorization: Bearer HOST_TOKEN
Content-Type: multipart/form-data

Form Data:
- photos: [select multiple image files]
```

**Expected Result:**
- ✅ 200 OK response
- ✅ Response includes photo URLs
- ✅ Images appear in Cloudinary dashboard
- ✅ Maximum 5 photos per listing enforced

### Test 7: File Validation Tests

#### Test Large File (should fail):
- Upload file > 5MB
- **Expected**: 400 Bad Request

#### Test Wrong File Type (should fail):
- Upload PDF or TXT file
- **Expected**: 400 Bad Request "Only jpeg, png, webp allowed"

#### Test Unauthorized Upload (should fail):
- Try uploading to another user's avatar
- **Expected**: 403 Forbidden

## 🔍 Part 3: Error Testing

### Test 8: Email Failures
Temporarily break email config in `.env`:
```env
EMAIL_PASS=wrong-password
```

Register a new user:
- ✅ Registration should still succeed (201)
- ✅ Check server logs for email error
- ✅ User created despite email failure

**Fix**: Restore correct EMAIL_PASS

### Test 9: Cloudinary Failures
Temporarily break Cloudinary config:
```env
CLOUDINARY_API_SECRET=wrong-secret
```

Try uploading avatar:
- ❌ Upload should fail (500 error)
- ✅ Check server logs for Cloudinary error

**Fix**: Restore correct CLOUDINARY_API_SECRET

## 📊 Part 4: Integration Testing

### Test 10: Complete User Journey
1. **Register** → Check welcome email
2. **Login** → Get token
3. **Upload avatar** → Check Cloudinary
4. **Create listing** (if HOST) → Success
5. **Upload listing photos** → Check Cloudinary
6. **Create booking** (if GUEST) → Check confirmation email
7. **Cancel booking** → Check cancellation email
8. **Reset password** → Check reset email

## 🎯 Success Checklist

### Email System ✅
- [ ] Welcome emails arrive with correct branding
- [ ] Password reset emails work with valid links
- [ ] Booking confirmation emails include all details
- [ ] Cancellation emails are sent properly
- [ ] Email failures don't crash the server
- [ ] Server logs show email sending status

### File Upload System ✅
- [ ] Avatar uploads work and replace old ones
- [ ] Listing photos upload (up to 5 per listing)
- [ ] File type validation works (only images)
- [ ] File size validation works (5MB limit)
- [ ] Ownership validation works (can't upload to others' resources)
- [ ] Images appear in Cloudinary dashboard
- [ ] Old files are cleaned up automatically

### Integration ✅
- [ ] Both systems work together without conflicts
- [ ] Server starts without configuration errors
- [ ] All endpoints respond correctly
- [ ] Error handling is graceful

## 🚨 Common Issues & Solutions

### Email Issues:
- **No emails received**: Check spam folder, verify Gmail app password
- **"Invalid credentials"**: Double-check EMAIL_USER and EMAIL_PASS
- **"Connection refused"**: Verify EMAIL_HOST and EMAIL_PORT

### File Upload Issues:
- **Upload fails**: Check Cloudinary credentials
- **"File too large"**: Ensure file is under 5MB
- **"Invalid file type"**: Only JPG, PNG, WebP allowed

### General Issues:
- **Server won't start**: Check all environment variables
- **500 errors**: Check server logs for detailed error messages
- **Authentication errors**: Ensure you're logged in with correct role

## 📞 Getting Help

If you encounter issues:

1. **Check server logs** for detailed error messages
2. **Verify environment variables** in `.env` file
3. **Test with Postman** using the provided examples
4. **Check your email spam folder**
5. **Verify Cloudinary dashboard** for uploaded images

---

**🎉 Once all tests pass, your Airbnb API has professional email notifications and secure file upload capabilities!**