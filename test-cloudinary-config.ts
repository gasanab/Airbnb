// Quick test script to verify your Cloudinary configuration
// Run with: npx tsx test-cloudinary-config.ts

import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

interface CloudinaryUsage {
  storage: {
    used_bytes: number;
  };
  transformations: {
    usage: number;
  };
  credits: {
    usage: number;
  };
  plan?: string;
}

interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

async function testCloudinaryConfig(): Promise<void> {
  console.log('☁️ Testing Cloudinary Configuration...\n');

  // Check environment variables
  const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.log('❌ Missing environment variables:');
    missing.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n💡 Please update your .env file with your Cloudinary credentials');
    console.log('🔗 Get them from: https://cloudinary.com/console');
    return;
  }

  console.log('✅ All environment variables found');
  console.log(`☁️ Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`🔑 API Key: ${process.env.CLOUDINARY_API_KEY}`);
  console.log(`🔐 API Secret: ${(process.env.CLOUDINARY_API_SECRET as string).substring(0, 8)}...`);

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  try {
    console.log('\n🔗 Testing Cloudinary connection...');
    
    // Test API connection by getting account details
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log(`📊 Status: ${result.status}`);

    // Get account usage info
    console.log('\n📈 Getting account information...');
    const usage = (await cloudinary.api.usage()) as CloudinaryUsage;
    
    console.log('✅ Account details retrieved:');
    console.log(`   📦 Storage used: ${(usage.storage.used_bytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   🔄 Transformations this month: ${usage.transformations.usage}`);
    console.log(`   📊 Credits used: ${usage.credits.usage}`);
    console.log(`   💰 Plan: ${usage.plan || 'Free'}`);

    // Test upload capability (upload a small test image)
    console.log('\n📤 Testing upload capability...');
    
    // Create a simple 1x1 pixel test image (base64)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const uploadResult = (await cloudinary.uploader.upload(testImageBase64, {
      folder: 'airbnb/test',
      public_id: `test-image-${Date.now()}`
    })) as UploadResult;

    console.log('✅ Test upload successful!');
    console.log(`   🖼️ Image URL: ${uploadResult.secure_url}`);
    console.log(`   🆔 Public ID: ${uploadResult.public_id}`);
    console.log(`   📏 Size: ${uploadResult.width}x${uploadResult.height}`);

    // Clean up test image
    console.log('\n🧹 Cleaning up test image...');
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('✅ Test image deleted');

    console.log('\n🎉 Cloudinary configuration is working perfectly!');
    console.log('💡 You can now test file uploads in your API');
    console.log('🔗 View your uploads at: https://cloudinary.com/console/media_library');

  } catch (error) {
    console.log('❌ Cloudinary configuration failed:');
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${errorMessage}`);
    
    if (errorMessage.includes('Invalid API key')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Double-check your CLOUDINARY_API_KEY');
      console.log('   2. Make sure CLOUDINARY_API_SECRET is correct');
      console.log('   3. Verify CLOUDINARY_CLOUD_NAME matches your account');
      console.log('   4. Check for extra spaces in your .env file');
    }
  }
}

testCloudinaryConfig();
