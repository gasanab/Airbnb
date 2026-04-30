"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBooking = exports.updateBookingStatus = exports.createBooking = exports.getUserBookings = exports.getBookingById = exports.getAllBookings = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../config/prisma"));
const email_1 = require("../config/email");
const error_handler_1 = require("../utils/error-handler");
const emails_1 = require("../templates/emails");
const cache_1 = require("../config/cache");
const validBookingStatus = (value) => Object.values(client_1.BookingStatus).includes(value);
const getAllBookings = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        if (page < 1 || limit < 1 || limit > 100) {
            res.status(400).json({ message: "Invalid pagination parameters" });
            return;
        }
        // Generate cache key
        const cacheKey = (0, cache_1.generateCacheKey)("bookings", { page, limit });
        // Check cache first
        const cached = (0, cache_1.getCache)(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }
        // Fetch bookings and count in parallel
        const [bookings, total] = await Promise.all([
            prisma_1.default.booking.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    guest: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true
                        }
                    },
                    listing: {
                        select: {
                            id: true,
                            title: true,
                            location: true,
                            pricePerNight: true
                        }
                    }
                }
            }),
            prisma_1.default.booking.count()
        ]);
        const totalPages = Math.ceil(total / limit);
        const result = {
            data: bookings,
            meta: {
                total,
                page,
                limit,
                totalPages
            }
        };
        // Cache for 30 seconds
        (0, cache_1.setCache)(cacheKey, result, 30);
        res.json(result);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "bookings.getAllBookings");
    }
};
exports.getAllBookings = getAllBookings;
const getBookingById = async (req, res) => {
    try {
        const id = req.params.id;
        const booking = await prisma_1.default.booking.findUnique({
            where: { id },
            include: {
                guest: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        phone: true
                    }
                },
                listing: {
                    include: {
                        host: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                                phone: true
                            }
                        },
                        photos: {
                            take: 3,
                            select: { url: true }
                        }
                    }
                }
            }
        });
        if (!booking) {
            res.status(404).json({ message: "Booking not found" });
            return;
        }
        res.json(booking);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "bookings.getBookingById");
    }
};
exports.getBookingById = getBookingById;
const getUserBookings = async (req, res) => {
    try {
        const userId = req.params.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        if (page < 1 || limit < 1 || limit > 100) {
            res.status(400).json({ message: "Invalid pagination parameters" });
            return;
        }
        // Check if user exists
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Generate cache key
        const cacheKey = (0, cache_1.generateCacheKey)(`bookings:user:${userId}`, { page, limit });
        // Check cache first
        const cached = (0, cache_1.getCache)(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }
        // Fetch user's bookings and count in parallel
        const [bookings, total] = await Promise.all([
            prisma_1.default.booking.findMany({
                where: { guestId: userId },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    listing: {
                        select: {
                            id: true,
                            title: true,
                            location: true,
                            pricePerNight: true
                        }
                    }
                }
            }),
            prisma_1.default.booking.count({ where: { guestId: userId } })
        ]);
        const totalPages = Math.ceil(total / limit);
        const result = {
            data: bookings,
            meta: {
                total,
                page,
                limit,
                totalPages
            }
        };
        // Cache for 30 seconds
        (0, cache_1.setCache)(cacheKey, result, 30);
        res.json(result);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "bookings.getUserBookings");
    }
};
exports.getUserBookings = getUserBookings;
const createBooking = async (req, res) => {
    try {
        const { listingId, checkIn, checkOut, guests } = req.body;
        if (!req.userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (listingId === undefined || !checkIn || !checkOut || guests === undefined) {
            res.status(400).json({ message: "Missing required booking fields: listingId, checkIn, checkOut, guests" });
            return;
        }
        const guest = await prisma_1.default.user.findUnique({ where: { id: req.userId } });
        if (!guest) {
            res.status(404).json({ message: "Guest user not found" });
            return;
        }
        const listing = await prisma_1.default.listing.findUnique({ where: { id: listingId } });
        if (!listing) {
            res.status(404).json({ message: "Listing not found" });
            return;
        }
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
            res.status(400).json({ message: "checkIn and checkOut must be valid dates" });
            return;
        }
        // Validate checkIn is before checkOut
        if (checkInDate >= checkOutDate) {
            res.status(400).json({ message: "checkOut must be after checkIn" });
            return;
        }
        // Validate checkIn is in the future
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
        if (checkInDate < now) {
            res.status(400).json({ message: "checkIn must be in the future" });
            return;
        }
        // Validate guests count
        if (guests < 1 || guests > listing.guests) {
            res.status(400).json({
                message: `Number of guests must be between 1 and ${listing.guests}`
            });
            return;
        }
        // Calculate total price server-side
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / millisecondsPerDay);
        const totalPrice = nights * listing.pricePerNight;
        // Use transaction for atomic conflict check and booking creation
        const booking = await prisma_1.default.$transaction(async (tx) => {
            // Check for date conflicts inside the transaction
            const conflict = await tx.booking.findFirst({
                where: {
                    listingId,
                    status: "CONFIRMED",
                    checkIn: { lt: checkOutDate },
                    checkOut: { gt: checkInDate },
                },
            });
            if (conflict) {
                throw new Error("BOOKING_CONFLICT");
            }
            return tx.booking.create({
                data: {
                    guestId: req.userId,
                    listingId,
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    guests,
                    totalPrice,
                    status: client_1.BookingStatus.PENDING
                },
                include: {
                    guest: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    listing: {
                        select: {
                            id: true,
                            title: true,
                            location: true,
                            pricePerNight: true
                        }
                    }
                }
            });
        });
        // Clear bookings cache
        (0, cache_1.deleteCacheByPrefix)("bookings");
        // Send booking confirmation email asynchronously
        (0, email_1.sendEmail)(guest.email, "Booking Confirmation", (0, emails_1.bookingConfirmationEmail)(guest.name, listing.title, listing.location, checkInDate.toLocaleDateString(), checkOutDate.toLocaleDateString(), totalPrice)).catch(error => {
            console.error("Failed to send booking confirmation email:", error);
        });
        res.status(201).json(booking);
    }
    catch (error) {
        // Handle booking conflict specifically
        if (error instanceof Error && error.message === "BOOKING_CONFLICT") {
            res.status(409).json({ message: "Listing is not available for the selected dates" });
            return;
        }
        (0, error_handler_1.handleControllerError)(error, res, "bookings.createBooking");
    }
};
exports.createBooking = createBooking;
const updateBookingStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = String(req.body.status ?? "").toUpperCase();
        if (!validBookingStatus(status)) {
            res.status(400).json({ message: "Invalid booking status" });
            return;
        }
        const existingBooking = await prisma_1.default.booking.findFirst({ where: { id } });
        if (!existingBooking) {
            res.status(404).json({ message: "Booking not found" });
            return;
        }
        if (req.role !== client_1.Role.ADMIN) {
            res.status(403).json({ message: "Only admins can update booking status" });
            return;
        }
        const booking = await prisma_1.default.booking.update({
            where: { id },
            data: { status }
        });
        // Clear bookings cache
        (0, cache_1.deleteCacheByPrefix)("bookings");
        res.status(200).json(booking);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "bookings.updateBookingStatus");
    }
};
exports.updateBookingStatus = updateBookingStatus;
const deleteBooking = async (req, res) => {
    try {
        const id = req.params.id;
        const existingBooking = await prisma_1.default.booking.findFirst({ where: { id } });
        if (!existingBooking) {
            res.status(404).json({ message: "Booking not found" });
            return;
        }
        if (req.role !== client_1.Role.ADMIN &&
            (req.role !== client_1.Role.GUEST || !req.userId || existingBooking.guestId !== req.userId)) {
            res.status(403).json({ message: "You can only cancel your own bookings" });
            return;
        }
        if (existingBooking.status === client_1.BookingStatus.CANCELLED) {
            res.status(400).json({ message: "Booking is already cancelled" });
            return;
        }
        const booking = await prisma_1.default.booking.update({
            where: { id },
            data: { status: client_1.BookingStatus.CANCELLED },
            include: { guest: true, listing: true }
        });
        // Clear bookings cache
        (0, cache_1.deleteCacheByPrefix)("bookings");
        // Send cancellation email asynchronously
        (0, email_1.sendEmail)(booking.guest.email, "Booking Cancelled", (0, emails_1.bookingCancellationEmail)(booking.guest.name, booking.listing.title, booking.checkIn.toLocaleDateString(), booking.checkOut.toLocaleDateString())).catch(error => {
            console.error("Failed to send booking cancellation email:", error);
        });
        res.status(200).json({ message: "Booking cancelled successfully" });
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "bookings.deleteBooking");
    }
};
exports.deleteBooking = deleteBooking;
