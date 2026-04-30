import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ 
  connectionString: process.env["DATABASE_URL"] as string 
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding...");

  // 1. Cleanup - delete in reverse dependency order
  console.log("🧹 Cleaning up existing data...");
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.listingPhoto.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create users with upsert
  console.log("👥 Creating users...");
  
  // Create 2 hosts
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "alice@example.com",
      username: "alice_host",
      phone: "+1234567890",
      password: await bcrypt.hash("password123", 10),
      role: "HOST",
      bio: "Experienced host with beautiful properties"
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Smith",
      email: "bob@example.com",
      username: "bob_host",
      phone: "+1234567891",
      password: await bcrypt.hash("password123", 10),
      role: "HOST",
      bio: "Luxury property specialist"
    },
  });

  // Create 3 guests
  const charlie = await prisma.user.upsert({
    where: { email: "charlie@example.com" },
    update: {},
    create: {
      name: "Charlie Brown",
      email: "charlie@example.com",
      username: "charlie_guest",
      phone: "+1234567892",
      password: await bcrypt.hash("password123", 10),
      role: "GUEST",
      bio: "Travel enthusiast"
    },
  });

  const diana = await prisma.user.upsert({
    where: { email: "diana@example.com" },
    update: {},
    create: {
      name: "Diana Prince",
      email: "diana@example.com",
      username: "diana_guest",
      phone: "+1234567893",
      password: await bcrypt.hash("password123", 10),
      role: "GUEST",
      bio: "Business traveler"
    },
  });

  const eve = await prisma.user.upsert({
    where: { email: "eve@example.com" },
    update: {},
    create: {
      name: "Eve Wilson",
      email: "eve@example.com",
      username: "eve_guest",
      phone: "+1234567894",
      password: await bcrypt.hash("password123", 10),
      role: "GUEST",
      bio: "Weekend getaway lover"
    },
  });

  // 3. Create listings - need individual creates to get IDs for bookings
  console.log("🏠 Creating listings...");
  
  const apartment = await prisma.listing.create({
    data: {
      title: "Modern Downtown Apartment",
      description: "Beautiful modern apartment in the heart of the city with stunning views and all amenities.",
      location: "New York",
      pricePerNight: 150.00,
      guests: 4,
      type: "APARTMENT",
      amenities: ["WiFi", "Kitchen", "Air Conditioning", "Parking", "TV"],
      rating: 4.8,
      hostId: alice.id
    }
  });

  const house = await prisma.listing.create({
    data: {
      title: "Cozy Family House",
      description: "Perfect family home with garden, close to schools and parks. Great for longer stays.",
      location: "Los Angeles",
      pricePerNight: 200.00,
      guests: 6,
      type: "HOUSE",
      amenities: ["WiFi", "Kitchen", "Garden", "Parking", "Washer/Dryer"],
      rating: 4.6,
      hostId: alice.id
    }
  });

  const villa = await prisma.listing.create({
    data: {
      title: "Luxury Beachfront Villa",
      description: "Exclusive villa with private beach access, infinity pool, and breathtaking ocean views.",
      location: "Miami",
      pricePerNight: 500.00,
      guests: 8,
      type: "VILLA",
      amenities: ["WiFi", "Pool", "Beach Access", "Kitchen", "Hot Tub", "Concierge"],
      rating: 4.9,
      hostId: bob.id
    }
  });

  const cabin = await prisma.listing.create({
    data: {
      title: "Mountain Retreat Cabin",
      description: "Rustic cabin in the mountains, perfect for hiking and nature lovers. Fireplace and hot tub included.",
      location: "Colorado",
      pricePerNight: 120.00,
      guests: 4,
      type: "CABIN",
      amenities: ["WiFi", "Fireplace", "Hot Tub", "Kitchen", "Hiking Trails"],
      rating: 4.7,
      hostId: bob.id
    }
  });

  // 4. Create bookings with future dates
  console.log("📅 Creating bookings...");
  
  const today = new Date();
  const futureDate1 = new Date(today);
  futureDate1.setDate(today.getDate() + 30); // 30 days from now
  const futureDate2 = new Date(futureDate1);
  futureDate2.setDate(futureDate1.getDate() + 3); // 3 nights

  const futureDate3 = new Date(today);
  futureDate3.setDate(today.getDate() + 60); // 60 days from now
  const futureDate4 = new Date(futureDate3);
  futureDate4.setDate(futureDate3.getDate() + 5); // 5 nights

  const futureDate5 = new Date(today);
  futureDate5.setDate(today.getDate() + 90); // 90 days from now
  const futureDate6 = new Date(futureDate5);
  futureDate6.setDate(futureDate5.getDate() + 2); // 2 nights

  // Calculate total prices correctly
  const nights1 = Math.ceil((futureDate2.getTime() - futureDate1.getTime()) / (1000 * 60 * 60 * 24));
  const nights2 = Math.ceil((futureDate4.getTime() - futureDate3.getTime()) / (1000 * 60 * 60 * 24));
  const nights3 = Math.ceil((futureDate6.getTime() - futureDate5.getTime()) / (1000 * 60 * 60 * 24));

  await prisma.booking.create({
    data: {
      guestId: charlie.id,
      listingId: apartment.id,
      checkIn: futureDate1,
      checkOut: futureDate2,
      guests: 2,
      totalPrice: nights1 * apartment.pricePerNight,
      status: "CONFIRMED"
    }
  });

  await prisma.booking.create({
    data: {
      guestId: diana.id,
      listingId: villa.id,
      checkIn: futureDate3,
      checkOut: futureDate4,
      guests: 4,
      totalPrice: nights2 * villa.pricePerNight,
      status: "PENDING"
    }
  });

  await prisma.booking.create({
    data: {
      guestId: eve.id,
      listingId: cabin.id,
      checkIn: futureDate5,
      checkOut: futureDate6,
      guests: 2,
      totalPrice: nights3 * cabin.pricePerNight,
      status: "CONFIRMED"
    }
  });

  // 5. Create reviews
  console.log("⭐ Creating reviews...");
  
  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Amazing apartment! Perfect location in downtown with great views. Host was very responsive and helpful.",
      userId: charlie.id,
      listingId: apartment.id
    }
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: "Beautiful villa with stunning ocean views. The pool was fantastic and the beach access was perfect for our family vacation.",
      userId: diana.id,
      listingId: villa.id
    }
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Cozy mountain retreat! The fireplace and hot tub were perfect after a day of hiking. Highly recommend!",
      userId: eve.id,
      listingId: cabin.id
    }
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: "Great family house with plenty of space. The garden was perfect for the kids and location was convenient.",
      userId: charlie.id,
      listingId: house.id
    }
  });

  console.log("✅ Seeding complete!");
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.listing.count()} listings`);
  console.log(`Created ${await prisma.booking.count()} bookings`);
  console.log(`Created ${await prisma.review.count()} reviews`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());