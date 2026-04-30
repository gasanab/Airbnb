"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListingStats = exports.deleteListing = exports.updateListing = exports.createListing = exports.getListingById = exports.getAllListings = exports.searchListings = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../config/prisma"));
const error_handler_1 = require("../utils/error-handler");
const cache_1 = require("../config/cache");
const validListingType = (value) => Object.values(client_1.ListingType).includes(value);
const searchListings = async (req, res) => {
    try {
        const { location, type, minPrice, maxPrice, guests, page = "1", limit = "10" } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
            res.status(400).json({ message: "Invalid pagination parameters" });
            return;
        }
        // Generate cache key
        const cacheKey = (0, cache_1.generateCacheKey)("search:listings", req.query);
        // Check cache first
        const cached = (0, cache_1.getCache)(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }
        // Build dynamic where conditions
        const where = {};
        if (location) {
            where.location = { contains: location, mode: "insensitive" };
        }
        if (type) {
            const normalizedType = type.toUpperCase();
            if (!validListingType(normalizedType)) {
                res.status(400).json({ message: "Invalid listing type" });
                return;
            }
            where.type = normalizedType;
        }
        if (minPrice || maxPrice) {
            where.pricePerNight = {};
            if (minPrice) {
                const min = Number(minPrice);
                if (isNaN(min) || min < 0) {
                    res.status(400).json({ message: "Invalid minPrice" });
                    return;
                }
                where.pricePerNight.gte = min;
            }
            if (maxPrice) {
                const max = Number(maxPrice);
                if (isNaN(max) || max < 0) {
                    res.status(400).json({ message: "Invalid maxPrice" });
                    return;
                }
                where.pricePerNight.lte = max;
            }
        }
        if (guests) {
            const guestCount = Number(guests);
            if (isNaN(guestCount) || guestCount < 1) {
                res.status(400).json({ message: "Invalid guests count" });
                return;
            }
            where.guests = { gte: guestCount };
        }
        // Fetch listings and count in parallel
        const [listings, total] = await Promise.all([
            prisma_1.default.listing.findMany({
                where,
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    host: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true
                        }
                    },
                    photos: {
                        take: 1,
                        select: { url: true }
                    },
                    _count: {
                        select: { reviews: true }
                    }
                }
            }),
            prisma_1.default.listing.count({ where })
        ]);
        const totalPages = Math.ceil(total / limitNum);
        const result = {
            data: listings,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages
            }
        };
        // Cache for 60 seconds
        (0, cache_1.setCache)(cacheKey, result, 60);
        res.json(result);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "listings.searchListings");
    }
};
exports.searchListings = searchListings;
const getAllListings = async (req, res) => {
    try {
        const location = req.query.location;
        const type = req.query.type;
        const maxPriceRaw = req.query.maxPrice;
        const pageRaw = req.query.page;
        const limitRaw = req.query.limit;
        const sortBy = req.query.sortBy;
        const orderRaw = req.query.order;
        const page = pageRaw ? Number.parseInt(pageRaw, 10) : 1;
        const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 10;
        if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
            res.status(400).json({ message: "page and limit must be positive integers" });
            return;
        }
        // Generate cache key
        const cacheKey = (0, cache_1.generateCacheKey)("listings", req.query);
        // Check cache first
        const cached = (0, cache_1.getCache)(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }
        const where = {};
        if (location) {
            where.location = { contains: location, mode: "insensitive" };
        }
        if (type) {
            const normalizedType = type.toUpperCase();
            if (!validListingType(normalizedType)) {
                res.status(400).json({ message: "Invalid listing type filter" });
                return;
            }
            where.type = normalizedType;
        }
        if (maxPriceRaw !== undefined) {
            const maxPrice = Number(maxPriceRaw);
            if (Number.isNaN(maxPrice)) {
                res.status(400).json({ message: "maxPrice must be a valid number" });
                return;
            }
            where.pricePerNight = { lte: maxPrice };
        }
        const orderBy = sortBy && (orderRaw === "asc" || orderRaw === "desc")
            ? { [sortBy]: orderRaw }
            : undefined;
        const [listings, total] = await Promise.all([
            prisma_1.default.listing.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy,
                select: {
                    id: true,
                    title: true,
                    location: true,
                    pricePerNight: true,
                    rating: true,
                    host: { select: { name: true, avatar: true } },
                    photos: { take: 1, select: { url: true } }
                }
            }),
            prisma_1.default.listing.count({ where })
        ]);
        const totalPages = Math.ceil(total / limit);
        const result = {
            data: listings,
            meta: {
                total,
                page,
                limit,
                totalPages
            }
        };
        // Cache for 60 seconds
        (0, cache_1.setCache)(cacheKey, result, 60);
        res.json(result);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "listings.getAllListings");
    }
};
exports.getAllListings = getAllListings;
const getListingById = async (req, res) => {
    try {
        const id = req.params.id;
        const listing = await prisma_1.default.listing.findUnique({
            where: { id },
            include: {
                host: { select: { id: true, name: true, avatar: true, bio: true } },
                photos: true,
                bookings: {
                    where: { status: "CONFIRMED" },
                    select: { checkIn: true, checkOut: true }
                }
            }
        });
        if (!listing) {
            res.status(404).json({ message: "Listing not found" });
            return;
        }
        res.status(200).json(listing);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "listings.getListingById");
    }
};
exports.getListingById = getListingById;
const createListing = async (req, res) => {
    try {
        const { title, description, location, pricePerNight, guests, type, amenities, rating } = req.body;
        if (!title ||
            !description ||
            !location ||
            pricePerNight === undefined ||
            guests === undefined ||
            !type ||
            !amenities) {
            res.status(400).json({ message: "Missing required listing fields" });
            return;
        }
        if (!req.userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const listing = await prisma_1.default.listing.create({
            data: {
                title,
                description,
                location,
                pricePerNight,
                guests,
                type,
                amenities,
                rating,
                hostId: req.userId
            }
        });
        // Clear listings cache
        (0, cache_1.deleteCacheByPrefix)("listings");
        (0, cache_1.deleteCacheByPrefix)("search:listings");
        (0, cache_1.deleteCacheByPrefix)("stats:listings");
        res.status(201).json(listing);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "listings.createListing");
    }
};
exports.createListing = createListing;
const updateListing = async (req, res) => {
    try {
        const id = req.params.id;
        const existingListing = await prisma_1.default.listing.findFirst({ where: { id } });
        const isAdmin = String(req.role) === "ADMIN";
        if (!existingListing) {
            res.status(404).json({ message: "Listing not found" });
            return;
        }
        if (!isAdmin && (req.role !== client_1.Role.HOST || !req.userId || existingListing.hostId !== req.userId)) {
            res.status(403).json({ message: "You can only edit your own listings" });
            return;
        }
        if (!isAdmin) {
            delete req.body.hostId;
        }
        const listing = await prisma_1.default.listing.update({
            where: { id },
            data: req.body
        });
        // Clear listings cache
        (0, cache_1.deleteCacheByPrefix)("listings");
        (0, cache_1.deleteCacheByPrefix)("search:listings");
        (0, cache_1.deleteCacheByPrefix)("stats:listings");
        res.status(200).json(listing);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "listings.updateListing");
    }
};
exports.updateListing = updateListing;
const deleteListing = async (req, res) => {
    try {
        const id = req.params.id;
        const existingListing = await prisma_1.default.listing.findFirst({ where: { id } });
        const isAdmin = String(req.role) === "ADMIN";
        if (!existingListing) {
            res.status(404).json({ message: "Listing not found" });
            return;
        }
        if (!isAdmin && (req.role !== client_1.Role.HOST || !req.userId || existingListing.hostId !== req.userId)) {
            res.status(403).json({ message: "You can only delete your own listings" });
            return;
        }
        await prisma_1.default.listing.delete({ where: { id } });
        // Clear listings cache
        (0, cache_1.deleteCacheByPrefix)("listings");
        (0, cache_1.deleteCacheByPrefix)("search:listings");
        (0, cache_1.deleteCacheByPrefix)("stats:listings");
        res.status(200).json({ message: "Listing deleted successfully" });
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "listings.deleteListing");
    }
};
exports.deleteListing = deleteListing;
const getListingStats = async (_req, res) => {
    try {
        const stats = await prisma_1.default.$queryRaw `
      SELECT
        location,
        COUNT(*)::int AS total,
        ROUND(AVG("pricePerNight")::numeric, 2) AS avg_price,
        MIN("pricePerNight") AS min_price,
        MAX("pricePerNight") AS max_price
      FROM listings
      GROUP BY location
      ORDER BY total DESC
    `;
        res.json(stats);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "listings.getListingStats");
    }
};
exports.getListingStats = getListingStats;
