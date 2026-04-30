# ✅ Complete Setup Checklist - Email & File Upload

## 🎯 Your Mission

Connect your personal Gmail and set up Cloudinary for your Airbnb API to enable:
- 📧 Professional email notifications
- 📸 Secure image uploads for avatars and listing photos

---

## 📧 Part 1: Gmail Setup

### Step 1: Enable 2-Step Verification
- [ ] Go to https://myaccount.google.com/security
- [ ] Click "2-Step Verification" 
- [ ] Complete setup with your phone number
- [ ] ✅ 2-Step Verification is now enabled

### Step 2: Generate App Password
- [ ] In Security settings, find "App passwords"
- [ ] Click "App passwords"
- [ ] Select "Mail" from dropdown
- [ ] Click "Generate"
- [ ] 📋 Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Replace these lines in your `.env` file:
```env
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=Airbnb <your-actual-gmail@gmail.com>
```

### Step 4: Test Email Configuration
- [ ] Run: `node test-email-config.js`
- [ ] ✅ Should show "Email configuration successful"
- [ ] 📬 Check your Gmail inbox for test email

---

## ☁️ Part 2: Cloudinary Setup

### Step 1: Create Cloudinary Account
- [ ] Go to https://cloudinary.com/users/register/free
- [ ] Sign up with your email
- [ ] Verify your email address
- [ ] Complete account setup

### Step 2: Get Your Credentials
- [ ] Login to Cloudinary Dashboard
- [ ] Copy these 3 values from your dashboard:
  - [ ] **Cloud Name** (e.g., `dxyz123abc`)
  - [ ] **API Key** (e.g., `123456789012345`)
  - [ ] **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### Step 3: Update .env File
Replace these lines in your `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
```

### Step 4: Test Cloudinary Configuration
- [ ] Run: `node test-cloudinary-config.js`
- [ ] ✅ Should show "Cloudinary configuration successful"
- [ ] 📊 Should display your account usage stats

---

## 🧪 Part 3: Integration Testing

### Step 1: Restart Your Server
- [ ] Stop your server (Ctrl+C)
- [ ] Run: `npm run dev`
- [ ] ✅ Server starts without errors

### Step 2: Test Email Notifications

#### Welcome Email Test:
- [ ] Register a new user via Postman
- [ ] ✅ Receive welcome email in your Gmail
- [ ] ✅ Email has Airbnb branding (#FF5A5F color)

#### Password Reset Test:
- [ ] Use "Forgot Password" endpoint
- [ ] ✅ Receive password reset email
- [ ] ✅ Reset link works and expires in 1 hour

#### Booking Email Test:
- [ ] Create a booking as GUEST
- [ ] ✅ Receive booking confirmation email
- [ ] Cancel the booking
- [ ] ✅ Receive cancellation email

### Step 3: Test File Uploads

#### Avatar Upload Test:
- [ ] Login as any user
- [ ] Upload avatar via Postman (JPG/PNG under 5MB)
- [ ] ✅ Get success response with image URL
- [ ] ✅ Image appears in Cloudinary dashboard

#### Listing Photos Test:
- [ ] Login as HOST user
- [ ] Upload listing photos (up to 5 images)
- [ ] ✅ Get success response with image URLs
- [ ] ✅ Images appear in Cloudinary dashboard

#### File Validation Test:
- [ ] Try uploading file > 5MB → Should get 400 error
- [ ] Try uploading PDF file → Should get 400 error
- [ ] Try uploading to another user's avatar → Should get 403 error

---

## 🎯 Final Verification

### Email System ✅
- [ ] Welcome emails work with your Gmail
- [ ] Password reset emails work
- [ ] Booking confirmation emails work
- [ ] Cancellation emails work
- [ ] Email failures don't crash server

### File Upload System ✅
- [ ] Avatar uploads work
- [ ] Listing photo uploads work (max 5)
- [ ] File type validation works
- [ ] File size validation works
- [ ] Ownership validation works
- [ ] Images appear in Cloudinary

### Integration ✅
- [ ] Both systems work together
- [ ] Server starts without errors
- [ ] All API endpoints respond correctly
- [ ] Error handling is graceful

---

## 🚨 Troubleshooting

### Email Issues:
- **No emails received**: Check spam folder, verify app password
- **"Invalid credentials"**: Double-check EMAIL_USER and EMAIL_PASS
- **Test script fails**: Verify 2-step verification is enabled

### Cloudinary Issues:
- **Upload fails**: Check cloud name, API key, and secret
- **"Invalid API key"**: Verify credentials from dashboard
- **Test script fails**: Check for typos in .env file

### General Issues:
- **Server won't start**: Check all environment variables
- **500 errors**: Check server logs for details
- **Authentication errors**: Make sure you're logged in

---

## 🎉 Success!

When all checkboxes are complete, your Airbnb API has:

✅ **Professional email notifications** using your personal Gmail  
✅ **Secure file upload system** using Cloudinary  
✅ **Complete integration** with proper error handling  
✅ **Production-ready** email and file management  

Your API now provides a complete user experience with email communications and image handling capabilities!

---

## 📞 Need Help?

1. **Run test scripts** to identify specific issues
2. **Check server logs** for detailed error messages  
3. **Verify credentials** in your .env file
4. **Test with Postman** using provided examples
5. **Check email spam folder** for notifications

**🚀 Ready to build amazing user experiences with your Airbnb API!**