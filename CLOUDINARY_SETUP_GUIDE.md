# ☁️ Cloudinary Setup Guide for Your Airbnb API

## 🎯 What is Cloudinary?

Cloudinary is a cloud service that stores and optimizes your images. Instead of storing photos on your server, they're stored in the cloud and automatically optimized.

## 📋 Step-by-Step Setup

### 1. Create Free Cloudinary Account
1. Go to: https://cloudinary.com/users/register/free
2. **Sign up** with your email
3. **Verify your email** 
4. **Complete the setup**

### 2. Get Your Credentials
1. **Login to Cloudinary Dashboard**
2. You'll see your **Dashboard** with credentials
3. **Copy these 3 values:**
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Update Your .env File

Replace these lines in your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key  
CLOUDINARY_API_SECRET=your-actual-api-secret
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### 4. Test Your File Upload

After updating your `.env` file, restart your server and test:

1. **Login as a user**
2. **Upload an avatar**: `POST /users/:id/avatar`
3. **Upload listing photos**: `POST /listings/:id/photos`

## 📸 What You Can Upload

### Supported File Types:
- ✅ **JPEG** (.jpg, .jpeg)
- ✅ **PNG** (.png)  
- ✅ **WebP** (.webp)
- ❌ **Other formats** (PDF, GIF, etc.) - rejected

### File Size Limits:
- ✅ **Up to 5MB** per file
- ❌ **Larger files** - rejected

### Upload Limits:
- **Avatar**: 1 per user (replaces old one)
- **Listing Photos**: Up to 5 per listing

## 🧪 Testing File Uploads in Postman

### Upload Avatar:
```
POST /users/1/avatar
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Body (form-data):
- Key: "image" 
- Type: File
- Value: Select your image file
```

### Upload Listing Photos:
```
POST /listings/1/photos  
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Body (form-data):
- Key: "photos"
- Type: File  
- Value: Select image file(s)
```

## 🔧 Troubleshooting

### "Cloudinary configuration error":
- Double-check your cloud name, API key, and secret
- Make sure there are no extra spaces
- Verify you're using the correct credentials from your dashboard

### "File too large" error:
- Check file size (must be under 5MB)
- Try compressing your image

### "Invalid file type" error:
- Only JPG, PNG, WebP are allowed
- Check the file extension

### Upload fails silently:
- Check server logs for detailed error messages
- Verify your Cloudinary credentials
- Check your internet connection

## ✅ Success Indicators

Your file uploads are working when:
- ✅ No errors in server logs
- ✅ Images appear in your Cloudinary dashboard
- ✅ API returns image URLs
- ✅ You can view uploaded images in browser

## 🎨 Image Optimization

Your API automatically optimizes images:
- **Automatic format** selection (WebP when supported)
- **Quality optimization** for faster loading
- **Responsive sizing** for different devices
- **CDN delivery** for global fast access

---

**Free Tier Limits:**
- 25GB storage
- 25GB monthly bandwidth  
- 25,000 transformations/month

This is more than enough for development and small projects!