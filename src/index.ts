import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import compression from "compression";
import morgan from "morgan";
import { connectDB } from "./config/prisma";
import { setupSwagger } from "./config/swagger";
import { generalLimiter } from "./middlewares/rateLimiter";
import { deprecateV1 } from "./middlewares/deprecation.middleware";
import v1Router from "./routes/v1/index";

const app = express();
const PORT = Number(process.env["PORT"] ?? 3000);

// Apply compression middleware first (before all routes)
app.use(compression());

// Apply morgan request logging
app.use(process.env["NODE_ENV"] === "production" ? morgan("combined") : morgan("dev"));

// Apply general rate limiting to all routes
app.use(generalLimiter);

app.use(express.json());

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Apply deprecation headers to v1 routes
app.use("/api/v1", deprecateV1);

// Mount API v1 routes
app.use("/api/v1", v1Router);

// 404 handler - must come before global error handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler - must be the last middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

const main = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`⚡ API Version: v1 at http://localhost:${PORT}/api/v1`);
    console.log(`⚡ Performance optimizations enabled:`);
    console.log(`   - Compression: ✅`);
    console.log(`   - Rate Limiting: ✅`);
    console.log(`   - Connection Pooling: ✅`);
    console.log(`   - Caching: ✅`);
  });
};

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
