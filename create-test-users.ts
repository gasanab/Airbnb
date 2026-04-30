// Script to create test users for Postman testing
// Run with: npx tsx create-test-users.ts

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
  },
  {
    name: 'Mike Guest',
    email: 'mike@test.com',
    username: 'mikeguest',
    phone: '+1234567894',
    password: 'password123',
    role: 'GUEST',
    bio: 'Business traveler'
  }
];

async function createTestUsers(): Promise<void> {
  console.log('🔧 Creating test users for Postman testing...\n');

  try {
    // Check if users already exist
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: testUsers.map(user => user.email)
        }
      }
    });

    if (existingUsers.length > 0) {
      console.log('⚠️  Some test users already exist. Deleting them first...');
      await prisma.user.deleteMany({
        where: {
          email: {
            in: existingUsers.map(user => user.email)
          }
        }
      });
      console.log('✅ Existing test users deleted\n');
    }

    // Create new test users
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      });

      console.log(`✅ Created ${userData.role}: ${userData.name} (${userData.email})`);
    }

    console.log('\n🎉 Test users created successfully!\n');
    
    // Display credentials for Postman
    console.log('📋 POSTMAN TEST CREDENTIALS:');
    console.log('='.repeat(50));
    
    testUsers.forEach(user => {
      console.log(`\n${user.role} USER:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Name: ${user.name}`);
    });

    console.log('\n📝 USAGE INSTRUCTIONS:');
    console.log('1. Use these credentials in Postman for login');
    console.log('2. HOST users can create/manage listings');
    console.log('3. GUEST users can create/manage bookings');
    console.log('4. ADMIN users have full access to all resources');
    console.log('5. All passwords are: password123');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
