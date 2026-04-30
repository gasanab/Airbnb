import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Create connection pool for better performance
const pool = new Pool({
  connectionString: databaseUrl,
  max: 10, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Timeout after 2 seconds if no connection available
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

export const connectDB = async (): Promise<void> => {
  await prisma.$connect();
  console.log("Connected to PostgreSQL with Prisma and Connection Pooling");
};

export default prisma;
