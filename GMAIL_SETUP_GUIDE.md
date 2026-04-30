# 📧 Gmail Setup Guide for Your Airbnb API

## 🎯 What You Need to Do

Replace the placeholder values in your `.env` file with your actual Gmail credentials.

## 📋 Step-by-Step Instructions

### 1. Enable 2-Step Verification
1. Go to: https://myaccount.google.com/security
2. Click **"2-Step Verification"**
3. Follow the setup (you'll need your phone number)
4. ✅ Complete the setup

### 2. Generate App Password
1. Still in Security settings, find **"App passwords"**
2. Click **"App passwords"** 
3. Select **"Mail"** from dropdown
4. Click **"Generate"**
5. 📋 **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### 3. Update Your .env File

Replace these lines in your `.env` file:

```env
EMAIL_USER=YOUR_ACTUAL_GMAIL_HERE
EMAIL_PASS=YOUR_16_CHAR_APP_PASSWORD_HERE  
EMAIL_FROM=Airbnb <YOUR_ACTUAL_GMAIL_HERE>
```

**Example:**
```env
EMAIL_USER=john.doe@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=Airbnb <john.doe@gmail.com>
```

### 4. Test Your Email Setup

After updating your `.env` file, restart your server and test:

1. **Register a new user** - you should receive a welcome email
2. **Use forgot password** - you should receive a reset email
3. **Create a booking** - you should receive a confirmation email

## 🚨 Important Notes

- **Never share your app password** - it's like your Gmail password
- **Use your actual Gmail address** (not a fake one)
- **The app password is different** from your regular Gmail password
- **Restart your server** after updating `.env` file

## 🧪 Quick Test

Once configured, you can test by registering a new user:

```bash
POST /auth/register
{
  "name": "Test User",
  "email": "your-test-email@gmail.com",
  "username": "testuser",
  "phone": "+1234567890", 
  "password": "password123",
  "role": "GUEST"
}
```

You should receive a welcome email at the address you specified!

## 🔧 Troubleshooting

### "Invalid credentials" error:
- Double-check your Gmail address
- Make sure you're using the app password (not regular password)
- Verify 2-step verification is enabled

### "Connection refused" error:
- Check your internet connection
- Verify EMAIL_HOST=smtp.gmail.com
- Verify EMAIL_PORT=587

### No email received:
- Check spam folder
- Verify the recipient email address
- Check server logs for error messages

## ✅ Success Indicators

Your email is working when:
- ✅ No errors in server logs
- ✅ Welcome emails arrive on registration
- ✅ Password reset emails work
- ✅ Booking confirmation emails work

---

**Need help?** Check the server console for error messages when testing emails.