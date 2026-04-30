// Script to create complete test data (users + listings) for Postman testing
// Run with: npx tsx create-test-data.ts

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

interface TestUser {
  name: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  role: 'HOST' | 'GUEST' | 'ADMIN';
  bio: string;
}

interface TestListing {
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN';
  amenities: string[];
}

const testUsers: TestUser[] = [
  {
    name: 'John Host',
    email: 'host@test.com',
    username: 'johnhost',
    phone: '+1234567890',
    password: 'password123',
    role: 'HOST',
    bio: 'Experienced host with multiple properties'
  },
  {
    name: 'Jane Guest',
    email: 'guest@test.com',
    username: 'janeguest',
    phone: '+1234567891',
    password: 'password123',
    role: 'GUEST',
    bio: 'Travel enthusiast looking for unique experiences'
  },
  {
    name: 'Admin User',
    email: 'admin@test.com',
    username: 'adminuser',
    phone: '+1234567892',
    password: 'password123',
    role: 'ADMIN',
    bio: 'System administrator'
  },
  {
    name: 'Sarah Host',
    email: 'sarah@test.com',
    username: 'sarahhost',
    phone: '+1234567893',
    password: 'password123',
    role: 'HOST',
    bio: 'Luxury property host in downtown area'
  }
];

const testListings: TestListing[] = [
  {
    title: 'Cozy Beach House',
    description: 'Beautiful beachfront property with stunning ocean views. Perfect for a relaxing getaway.',
    location: 'Malibu, California',
    pricePerNight: 250.00,
    guests: 6,
    type: 'HOUSE',
    amenities: ['WiFi', 'Pool', 'Beach Access', 'Parking', 'Kitchen']
  },
  {
    title: 'Downtown Luxury Apartment',
    description: 'Modern apartment in the heart of the city with all amenities.',
    location: 'New York, NY',
    pricePerNight: 180.00,
    guests: 4,
    type: 'APARTMENT',
    amenities: ['WiFi', 'Gym', 'Concierge', 'Parking']
  },
  {
    title: 'Mountain Cabin Retreat',
    description: 'Rustic cabin surrounded by nature, perfect for hiking and outdoor activities.',
    location: 'Aspen, Colorado',
    pricePerNight: 200.00,
    guests: 8,
    type: 'CABIN',
    amenities: ['WiFi', 'Fireplace', 'Hot Tub', 'Hiking Trails']
  },
  {
    title: 'Luxury Villa with Pool',
    description: 'Spacious villa with private pool and garden, ideal for families.',
    location: 'Miami, Florida',
    pricePerNight: 350.00,
    guests: 10,
    type: 'VILLA',
    amenities: ['WiFi', 'Private Pool', 'Garden', 'BBQ', 'Parking']
  }
];

async function createTestData(): Promise<void> {
  console.log('🔧 Creating complete test data for Postman testing...\n');

  try {
    // Clean up existing test data
    console.log('🧹 Cleaning up existing test data...');
    await prisma.booking.deleteMany({});
    await prisma.listingPhoto.deleteMany({});
    await prisma.listing.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: testUsers.map(user => user.email)
        }
      }
    });
    console.log('✅ Cleanup completed\n');

    // Create test users
    console.log('👥 Creating test users...');
    const createdUsers = [];
    
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      });

      createdUsers.push(user);
      console.log(`✅ Created ${userData.role}: ${userData.name} (${userData.email})`);
    }

    // Create test listings (only for HOST users)
    console.log('\n🏠 Creating test listings...');
    const hostUsers = createdUsers.filter(user => user.role === 'HOST');
    
    for (let i = 0; i < testListings.length; i++) {
      const listingData = testListings[i];
      const hostUser = hostUsers[i % hostUsers.length]; // Distribute listings among hosts
      
      const listing = await prisma.listing.create({
        data: {
          ...listingData,
          hostId: hostUser.id
        }
      });

      console.log(`✅ Created listing: ${listingData.title} (Host: ${hostUser.name})`);
    }

    console.log('\n🎉 Test data created successfully!\n');
    
    // Display credentials for Postman
    console.log('📋 POSTMAN TEST CREDENTIALS:');
    console.log('='.repeat(60));
    
    testUsers.forEach(user => {
      console.log(`\n${user.role} USER:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Name: ${user.name}`);
    });

    console.log('\n📝 TESTING WORKFLOW:');
    console.log('='.repeat(60));
    console.log('1. LOGIN as HOST (host@test.com) to:');
    console.log('   - Create/update/delete listings');
    console.log('   - Upload listing photos');
    console.log('   - Upload avatar');
    console.log('');
    console.log('2. LOGIN as GUEST (guest@test.com) to:');
    console.log('   - View listings');
    console.log('   - Create bookings');
    console.log('   - Cancel own bookings');
    console.log('   - Upload avatar');
    console.log('');
    console.log('3. LOGIN as ADMIN (admin@test.com) to:');
    console.log('   - Access all endpoints');
    console.log('   - Manage all users');
    console.log('   - Update booking statuses');
    console.log('   - Delete any resource');

    console.log('\n🔗 SAMPLE API CALLS:');
    console.log('='.repeat(60));
    console.log('• GET /listings - View all listings (no auth needed)');
    console.log('• POST /auth/login - Login with test credentials');
    console.log('• GET /auth/me - Get current user profile');
    console.log('• POST /listings - Create listing (HOST only)');
    console.log('• POST /bookings - Create booking (GUEST only)');
    console.log('• POST /users/1/avatar - Upload avatar (owner only)');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
