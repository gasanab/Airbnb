import { Router } from "express";
import {
  createListing,
  deleteListing,
  getAllListings,
  getListingById,
  getListingStats,
  searchListings,
  updateListing
} from "../../controllers/listings.controller";
import { authenticate, requireHost } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createListingSchema,
  deleteListingSchema,
  getAllListingsSchema,
  getListingByIdSchema,
  updateListingSchema
} from "../../validators/listings.validator";
import { generalLimiter, strictLimiter } from "../../middlewares/rateLimiter";

const listingsRouter = Router();

// Apply general rate limiting to all routes
listingsRouter.use(generalLimiter);

/**
 * @swagger
 * /listings/search:
 *   get:
 *     summary: Search listings with filters
 *     description: Advanced search for listings with multiple filter options and pagination
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location (case-insensitive partial match)
 *         example: "New York"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [APARTMENT, HOUSE, VILLA, CABIN]
 *         description: Filter by property type
 *         example: "APARTMENT"
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *         description: Minimum price per night
 *         example: 50
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *         description: Maximum price per night
 *         example: 300
 *       - in: query
 *         name: guests
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Minimum number of guests the property can accommodate
 *         example: 4
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
 *         description: Number of listings per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Listing'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
listingsRouter.get("/search", searchListings);

/**
 * @swagger
 * /listings/stats:
 *   get:
 *     summary: Get listing statistics
 *     description: Get aggregated statistics for listings grouped by location using raw SQL
 *     tags: [Listings]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   location:
 *                     type: string
 *                     example: "New York"
 *                   total:
 *                     type: integer
 *                     example: 15
 *                   avg_price:
 *                     type: number
 *                     format: decimal
 *                     example: 225.50
 *                   min_price:
 *                     type: number
 *                     format: float
 *                     example: 100.00
 *                   max_price:
 *                     type: number
 *                     format: float
 *                     example: 500.00
 */
listingsRouter.get("/stats", getListingStats);

/**
 * @swagger
 * /listings:
 *   get:
 *     summary: Get all listings
 *     description: Retrieve a paginated list of listings with optional filtering
 *     tags: [Listings]
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
 *         description: Number of listings per page
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location (case-insensitive partial match)
 *         example: "Malibu"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [APARTMENT, HOUSE, VILLA, CABIN]
 *         description: Filter by property type
 *         example: "HOUSE"
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *         description: Maximum price per night
 *         example: 300
 *       - in: query
 *         name: guests
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Minimum number of guests the property can accommodate
 *         example: 4
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [pricePerNight, createdAt]
 *         description: Field to sort by
 *         example: "pricePerNight"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *         example: "asc"
 *     responses:
 *       200:
 *         description: Listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
listingsRouter.get("/", validate(getAllListingsSchema), getAllListings);

/**
 * @swagger
 * /listings/{id}:
 *   get:
 *     summary: Get listing by ID
 *     description: Retrieve detailed information about a specific listing
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Listing ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Listing retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Listing not found"
 */
listingsRouter.get("/:id", validate(getListingByIdSchema), getListingById);

/**
 * @swagger
 * /listings:
 *   post:
 *     summary: Create a new listing (HOST only)
 *     description: Create a new property listing (requires HOST role)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateListingInput'
 *     responses:
 *       201:
 *         description: Listing created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: HOST role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Only hosts can perform this action"
 */
listingsRouter.post("/", strictLimiter, authenticate, requireHost, validate(createListingSchema), createListing);

/**
 * @swagger
 * /listings/{id}:
 *   put:
 *     summary: Update listing
 *     description: Update a listing (only by owner or admin)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Listing ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Beach House"
 *               description:
 *                 type: string
 *                 example: "Updated description with new amenities"
 *               location:
 *                 type: string
 *                 example: "Malibu, California"
 *               pricePerNight:
 *                 type: number
 *                 format: float
 *                 example: 275.00
 *               guests:
 *                 type: integer
 *                 example: 8
 *               type:
 *                 type: string
 *                 enum: [APARTMENT, HOUSE, VILLA, CABIN]
 *                 example: "HOUSE"
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["WiFi", "Pool", "Beach Access", "Parking", "Hot Tub"]
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Can only update own listings (unless admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You can only edit your own listings"
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
listingsRouter.put("/:id", authenticate, validate(updateListingSchema), updateListing);

/**
 * @swagger
 * /listings/{id}:
 *   delete:
 *     summary: Delete listing
 *     description: Delete a listing (only by owner or admin)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Listing ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Listing deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Listing deleted successfully"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Can only delete own listings (unless admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You can only delete your own listings"
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
listingsRouter.delete("/:id", authenticate, validate(deleteListingSchema), deleteListing);

export default listingsRouter;
