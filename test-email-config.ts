// Quick test script to verify your email configuration
// Run with: npx tsx test-email-config.ts

import 'dotenv/config';
import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

async function testEmailConfig(): Promise<void> {
  console.log('🧪 Testing Email Configuration...\n');

  // Check environment variables
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.log('❌ Missing environment variables:');
    missing.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n💡 Please update your .env file with your Gmail credentials');
    return;
  }

  console.log('✅ All environment variables found');
  console.log(`📧 Email User: ${process.env.EMAIL_USER}`);
  console.log(`📤 Email From: ${process.env.EMAIL_FROM}`);
  console.log(`🏠 Email Host: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}\n`);

  // Test connection
  const emailConfig: EmailConfig = {
    host: process.env.EMAIL_HOST as string,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASS as string
    }
  };

  const transporter = nodemailer.createTransport(emailConfig);

  try {
    console.log('🔗 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    console.log('\n📨 Sending test email...');
    const testEmail = {
      from: process.env.EMAIL_FROM,
      to: 'gasanab5@gmail.com', // Send test email to your Gmail
      subject: 'Airbnb API - Email Test Successful! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FF5A5F; color: white; padding: 20px; text-align: center;">
            <h1>🎉 Email Configuration Successful!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Congratulations! Your Airbnb API email system is working perfectly with <strong>gasanab5@gmail.com</strong>.</p>
            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li>Email Host: ${process.env.EMAIL_HOST}</li>
              <li>Email User: ${process.env.EMAIL_USER}</li>
              <li>Test Time: ${new Date().toLocaleString()}</li>
            </ul>
            <p>You can now receive:</p>
            <ul>
              <li>✅ Welcome emails on registration</li>
              <li>✅ Booking confirmation emails</li>
              <li>✅ Booking cancellation emails</li>
              <li>✅ Password reset emails</li>
            </ul>
            <p style="color: #FF5A5F; font-weight: bold;">Your Airbnb API is ready for production! 🚀</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`📬 Check your inbox: ${process.env.EMAIL_USER}`);
    
    console.log('\n🎉 Email configuration is working perfectly!');
    console.log('💡 You can now test user registration to receive welcome emails');

  } catch (error) {
    console.log('❌ Email configuration failed:');
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`   Error: ${errorMessage}`);
    
    if (errorMessage.includes('Invalid login')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Make sure 2-Step Verification is enabled on your Gmail');
      console.log('   2. Use an App Password (not your regular Gmail password)');
      console.log('   3. Double-check EMAIL_USER and EMAIL_PASS in .env file');
    }
  }
}

testEmailConfig();
