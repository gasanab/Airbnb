"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}
// Create connection pool for better performance
const pool = new pg_1.Pool({
    connectionString: databaseUrl,
    max: 10, // Maximum number of connections
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // Timeout after 2 seconds if no connection available
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});
const connectDB = async () => {
    await prisma.$connect();
    console.log("Connected to PostgreSQL with Prisma and Connection Pooling");
};
exports.connectDB = connectDB;
exports.default = prisma;
