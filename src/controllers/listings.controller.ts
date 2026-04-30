import { ListingType, Prisma, Role } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { handleControllerError } from "../utils/error-handler";
import { getCache, setCache, deleteCacheByPrefix, generateCacheKey } from "../config/cache";

const validListingType = (value: string): value is ListingType =>
  Object.values(ListingType).includes(value as ListingType);

export const searchListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      location,
      type,
      minPrice,
      maxPrice,
      guests,
      page = "1",
      limit = "10"
    } = req.query as {
      location?: string;
      type?: string;
      minPrice?: string;
      maxPrice?: string;
      guests?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      res.status(400).json({ message: "Invalid pagination parameters" });
      return;
    }

    // Generate cache key
    const cacheKey = generateCacheKey("search:listings", req.query as Record<string, any>);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    // Build dynamic where conditions
    const where: Prisma.ListingWhereInput = {};

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
      prisma.listing.findMany({
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
      prisma.listing.count({ where })
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
    setCache(cacheKey, result, 60);

    res.json(result);
  } catch (error) {
    handleControllerError(error, res, "listings.searchListings");
  }
};

export const getAllListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const location = req.query.location as string | undefined;
    const type = req.query.type as string | undefined;
    const maxPriceRaw = req.query.maxPrice as string | undefined;
    const pageRaw = req.query.page as string | undefined;
    const limitRaw = req.query.limit as string | undefined;
    const sortBy = req.query.sortBy as "pricePerNight" | "createdAt" | undefined;
    const orderRaw = req.query.order as string | undefined;

    const page = pageRaw ? Number.parseInt(pageRaw, 10) : 1;
    const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 10;

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
      res.status(400).json({ message: "page and limit must be positive integers" });
      return;
    }

    // Generate cache key
    const cacheKey = generateCacheKey("listings", req.query as Record<string, any>);
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const where: Prisma.ListingWhereInput = {};

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

    const orderBy =
      sortBy && (orderRaw === "asc" || orderRaw === "desc")
        ? { [sortBy]: orderRaw }
        : undefined;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
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
      prisma.listing.count({ where })
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
    setCache(cacheKey, result, 60);

    res.json(result);
  } catch (error) {
    handleControllerError(error, res, "listings.getAllListings");
  }
};

export const getListingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const listing = await prisma.listing.findUnique({
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
  } catch (error) {
    handleControllerError(error, res, "listings.getListingById");
  }
};

export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, location, pricePerNight, guests, type, amenities, rating } = req.body as {
        title?: string;
        description?: string;
        location?: string;
        pricePerNight?: number;
        guests?: number;
        type?: ListingType;
        amenities?: string[];
        rating?: number;
      };

    if (
      !title ||
      !description ||
      !location ||
      pricePerNight === undefined ||
      guests === undefined ||
      !type ||
      !amenities
    ) {
      res.status(400).json({ message: "Missing required listing fields" });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const listing = await prisma.listing.create({
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
    deleteCacheByPrefix("listings");
    deleteCacheByPrefix("search:listings");
    deleteCacheByPrefix("stats:listings");

    res.status(201).json(listing);
  } catch (error) {
    handleControllerError(error, res, "listings.createListing");
  }
};

export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existingListing = await prisma.listing.findFirst({ where: { id } });
    const isAdmin = String(req.role) === "ADMIN";

    if (!existingListing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (!isAdmin && (req.role !== Role.HOST || !req.userId || existingListing.hostId !== req.userId)) {
      res.status(403).json({ message: "You can only edit your own listings" });
      return;
    }

    if (!isAdmin) {
      delete req.body.hostId;
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: req.body
    });

    // Clear listings cache
    deleteCacheByPrefix("listings");
    deleteCacheByPrefix("search:listings");
    deleteCacheByPrefix("stats:listings");

    res.status(200).json(listing);
  } catch (error) {
    handleControllerError(error, res, "listings.updateListing");
  }
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existingListing = await prisma.listing.findFirst({ where: { id } });
    const isAdmin = String(req.role) === "ADMIN";

    if (!existingListing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (!isAdmin && (req.role !== Role.HOST || !req.userId || existingListing.hostId !== req.userId)) {
      res.status(403).json({ message: "You can only delete your own listings" });
      return;
    }

    await prisma.listing.delete({ where: { id } });

    // Clear listings cache
    deleteCacheByPrefix("listings");
    deleteCacheByPrefix("search:listings");
    deleteCacheByPrefix("stats:listings");

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    handleControllerError(error, res, "listings.deleteListing");
  }
};

export const getListingStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await prisma.$queryRaw`
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
  } catch (error) {
    handleControllerError(error, res, "listings.getListingStats");
  }
};
