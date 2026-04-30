"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_controller_1 = require("../../controllers/stats.controller");
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const statsRouter = (0, express_1.Router)();
// Apply general rate limiting to all routes
statsRouter.use(rateLimiter_1.generalLimiter);
/**
 * @swagger
 * /stats/listings:
 *   get:
 *     summary: Get listing statistics
 *     description: Get aggregated statistics for all listings including totals, averages, and groupings
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Listing statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalListings:
 *                   type: integer
 *                   description: Total number of listings
 *                   example: 120
 *                 averagePrice:
 *                   type: number
 *                   format: float
 *                   description: Average price per night across all listings
 *                   example: 145.50
 *                 byLocation:
 *                   type: array
 *                   description: Listings count grouped by location
 *                   items:
 *                     type: object
 *                     properties:
 *                       location:
 *                         type: string
 *                         example: "New York"
 *                       _count:
 *                         type: object
 *                         properties:
 *                           location:
 *                             type: integer
 *                             example: 30
 *                 byType:
 *                   type: array
 *                   description: Listings count grouped by property type
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [APARTMENT, HOUSE, VILLA, CABIN]
 *                         example: "APARTMENT"
 *                       _count:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: integer
 *                             example: 45
 */
statsRouter.get("/listings", stats_controller_1.getListingStats);
/**
 * @swagger
 * /stats/users:
 *   get:
 *     summary: Get user statistics
 *     description: Get aggregated statistics for all users including totals and role distribution
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                   description: Total number of users
 *                   example: 250
 *                 byRole:
 *                   type: array
 *                   description: Users count grouped by role
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                         enum: [HOST, GUEST, ADMIN]
 *                         example: "GUEST"
 *                       _count:
 *                         type: object
 *                         properties:
 *                           role:
 *                             type: integer
 *                             example: 180
 */
statsRouter.get("/users", stats_controller_1.getUserStats);
exports.default = statsRouter;
