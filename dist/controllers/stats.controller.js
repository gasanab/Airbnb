"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.getListingStats = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const error_handler_1 = require("../utils/error-handler");
const cache_1 = require("../config/cache");
const getListingStats = async (_req, res) => {
    try {
        const cacheKey = "stats:listings";
        // Check cache first
        const cached = (0, cache_1.getCache)(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }
        // Fetch all stats in parallel
        const [totalListings, averagePriceResult, byLocation, byType] = await Promise.all([
            // Total count of listings
            prisma_1.default.listing.count(),
            // Average price
            prisma_1.default.listing.aggregate({
                _avg: {
                    pricePerNight: true
                }
            }),
            // Count by location
            prisma_1.default.listing.groupBy({
                by: ['location'],
                _count: {
                    location: true
                },
                orderBy: {
                    _count: {
                        location: 'desc'
                    }
                }
            }),
            // Count by type
            prisma_1.default.listing.groupBy({
                by: ['type'],
                _count: {
                    type: true
                },
                orderBy: {
                    _count: {
                        type: 'desc'
                    }
                }
            })
        ]);
        const result = {
            totalListings,
            averagePrice: averagePriceResult._avg.pricePerNight
                ? Math.round(averagePriceResult._avg.pricePerNight * 100) / 100
                : 0,
            byLocation: byLocation.map(item => ({
                location: item.location,
                _count: { location: item._count.location }
            })),
            byType: byType.map(item => ({
                type: item.type,
                _count: { type: item._count.type }
            }))
        };
        // Cache for 5 minutes
        (0, cache_1.setCache)(cacheKey, result, 300);
        res.json(result);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "stats.getListingStats");
    }
};
exports.getListingStats = getListingStats;
const getUserStats = async (_req, res) => {
    try {
        const cacheKey = "stats:users";
        // Check cache first
        const cached = (0, cache_1.getCache)(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }
        // Fetch user stats in parallel
        const [totalUsers, byRole] = await Promise.all([
            // Total count of users
            prisma_1.default.user.count(),
            // Count by role
            prisma_1.default.user.groupBy({
                by: ['role'],
                _count: {
                    role: true
                },
                orderBy: {
                    _count: {
                        role: 'desc'
                    }
                }
            })
        ]);
        const result = {
            totalUsers,
            byRole: byRole.map(item => ({
                role: item.role,
                _count: { role: item._count.role }
            }))
        };
        // Cache for 5 minutes
        (0, cache_1.setCache)(cacheKey, result, 300);
        res.json(result);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "stats.getUserStats");
    }
};
exports.getUserStats = getUserStats;
