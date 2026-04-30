# 📧 Gmail Setup for gasanab5@gmail.com

## 🎯 What You Need to Do

You need to generate an **App Password** for your Gmail account (gasanab5@gmail.com) so your Airbnb API can send emails.

## 📋 Step-by-Step Instructions

### Step 1: Enable 2-Step Verification
1. **Go to**: https://myaccount.google.com/security
2. **Sign in** with gasanab5@gmail.com
3. **Find "2-Step Verification"** and click it
4. **Click "Get Started"** and follow the setup
5. **Use your phone number** to complete verification
6. ✅ **2-Step Verification is now enabled**

### Step 2: Generate App Password
1. **Still in Security settings**, scroll down to find **"App passwords"**
   - (This option only appears after 2-step verification is enabled)
2. **Click "App passwords"**
3. **Select "Mail"** from the dropdown menu
4. **Click "Generate"**
5. **Copy the 16-character password** that appears
   - It looks like: `abcd efgh ijkl mnop` (4 groups of 4 characters)
   - This is NOT your regular Gmail password!

### Step 3: Update Your .env File
Your `.env` file is already updated with your email address. Now you just need to replace the app password:

**Find this line in your `.env` file:**
```env
EMAIL_PASS=YOUR_16_CHAR_APP_PASSWORD_HERE
```

**Replace it with your actual app password:**
```env
EMAIL_PASS=abcd efgh ijkl mnop
```
*(Use the actual password you copied, not this example)*

### Step 4: Test Your Setup
1. **Save your `.env` file**
2. **Run the test script:**
   ```bash
   node test-email-config.js
   ```
3. **Expected result:**
   - ✅ "Email configuration successful"
   - 📧 Test email sent to gasanab5@gmail.com
   - 📬 Check your Gmail inbox for the test email

## 🎯 Your Final Configuration

After setup, your `.env` file should look like this:

```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=gasanab5@gmail.com
EMAIL_PASS=your-actual-16-char-app-password
EMAIL_FROM=Airbnb <gasanab5@gmail.com>
```

## 🧪 Testing Your Email System

Once configured, test these features:

### 1. Welcome Email Test
Register a new user and check gasanab5@gmail.com for welcome email:
```json
POST /auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "username": "testuser",
  "phone": "+1234567890",
  "password": "password123",
  "role": "GUEST"
}
```

### 2. Password Reset Test
Use forgot password and check gasanab5@gmail.com:
```json
POST /auth/forgot-password
{
  "email": "test@example.com"
}
```

### 3. Booking Emails Test
- Create a booking → Check for confirmation email
- Cancel a booking → Check for cancellation email

## 🚨 Troubleshooting

### If you get "Invalid credentials" error:
1. **Double-check** you're using the **app password** (not your regular Gmail password)
2. **Make sure** 2-step verification is enabled
3. **Verify** the app password has no extra spaces

### If no emails are received:
1. **Check spam folder** in gasanab5@gmail.com
2. **Run the test script** to verify configuration
3. **Check server logs** for error messages

### If 2-step verification setup fails:
1. **Make sure** you have access to your phone
2. **Try using** the Google Authenticator app instead of SMS
3. **Contact Google support** if needed

## ✅ Success Indicators

Your email system is working when:
- ✅ Test script shows "Email configuration successful"
- ✅ Test email arrives in gasanab5@gmail.com
- ✅ User registration sends welcome emails
- ✅ Password reset sends reset emails
- ✅ Booking actions send notification emails

## 🎉 Next Steps

After email setup works:
1. **Set up Cloudinary** for file uploads
2. **Test the complete system** with Postman
3. **Your Airbnb API will be fully functional!**

---

**📞 Need help?** Check the server console for detailed error messages when testing emails.