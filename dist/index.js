"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const prisma_1 = require("./config/prisma");
const swagger_1 = require("./config/swagger");
const rateLimiter_1 = require("./middlewares/rateLimiter");
const deprecation_middleware_1 = require("./middlewares/deprecation.middleware");
const index_1 = __importDefault(require("./routes/v1/index"));
const app = (0, express_1.default)();
const PORT = Number(process.env["PORT"] ?? 3000);
// Apply compression middleware first (before all routes)
app.use((0, compression_1.default)());
// Apply morgan request logging
app.use(process.env["NODE_ENV"] === "production" ? (0, morgan_1.default)("combined") : (0, morgan_1.default)("dev"));
// Apply general rate limiting to all routes
app.use(rateLimiter_1.generalLimiter);
app.use(express_1.default.json());
// Setup Swagger documentation
(0, swagger_1.setupSwagger)(app);
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
// Apply deprecation headers to v1 routes
app.use("/api/v1", deprecation_middleware_1.deprecateV1);
// Mount API v1 routes
app.use("/api/v1", index_1.default);
// 404 handler - must come before global error handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});
// Global error handler - must be the last middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong" });
});
const main = async () => {
    await (0, prisma_1.connectDB)();
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
