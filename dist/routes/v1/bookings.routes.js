"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookings_controller_1 = require("../../controllers/bookings.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const bookings_validator_1 = require("../../validators/bookings.validator");
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const bookingsRouter = (0, express_1.Router)();
// Apply general rate limiting to all routes
bookingsRouter.use(rateLimiter_1.generalLimiter);
/**
 * @swagger
 * /users/{id}/bookings:
 *   get:
 *     summary: Get all bookings for a user
 *     description: Retrieve paginated bookings for a specific user
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of bookings per page
 *     responses:
 *       200:
 *         description: User bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
bookingsRouter.get("/users/:id/bookings", bookings_controller_1.getUserBookings);
/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     description: Retrieve a paginated list of all bookings with user and listing details
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of bookings per page
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
bookingsRouter.get("/", bookings_controller_1.getAllBookings);
/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     description: Retrieve detailed information about a specific booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Booking not found"
 */
bookingsRouter.get("/:id", (0, validate_middleware_1.validate)(bookings_validator_1.getBookingByIdSchema), bookings_controller_1.getBookingById);
/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking (GUEST only)
 *     description: |
 *       Create a new booking for a listing.
 *
 *       **Important Notes:**
 *       - Only GUEST users can create bookings
 *       - Total price is automatically calculated: (nights × pricePerNight)
 *       - Check-in must be in the future
 *       - Check-out must be after check-in
 *       - System checks for booking conflicts automatically
 *       - Confirmation email is sent automatically
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingInput'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error (invalid dates, past check-in, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidDates:
 *                 summary: Invalid date range
 *                 value:
 *                   message: "checkOut must be after checkIn"
 *               pastDate:
 *                 summary: Past check-in date
 *                 value:
 *                   message: "checkIn must be in the future"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: GUEST role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Only guests can perform this action"
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Listing not found"
 *       409:
 *         description: Booking conflict (dates not available)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Listing is not available for the selected dates"
 */
bookingsRouter.post("/", rateLimiter_1.strictLimiter, auth_middleware_1.authenticate, auth_middleware_1.requireGuest, (0, validate_middleware_1.validate)(bookings_validator_1.createBookingSchema), bookings_controller_1.createBooking);
/**
 * @swagger
 * /bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (Admin only)
 *     description: Update the status of a booking (PENDING → CONFIRMED → CANCELLED)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, CANCELLED]
 *                 example: "CONFIRMED"
 *                 description: New booking status
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid status value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Invalid booking status"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Only admins can update booking status"
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
bookingsRouter.patch("/:id/status", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(bookings_validator_1.updateBookingStatusSchema), bookings_controller_1.updateBookingStatus);
/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     description: |
 *       Cancel a booking (changes status to CANCELLED, doesn't delete the record).
 *
 *       **Access Control:**
 *       - Guests can only cancel their own bookings
 *       - Admins can cancel any booking
 *       - Cancellation email is sent automatically
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Booking already cancelled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Booking is already cancelled"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Can only cancel own bookings (unless admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You can only cancel your own bookings"
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
bookingsRouter.delete("/:id", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(bookings_validator_1.deleteBookingSchema), bookings_controller_1.deleteBooking);
exports.default = bookingsRouter;
