import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { handleControllerError } from "../utils/error-handler";
import { getCache, setCache, deleteCacheByPrefix, generateCacheKey } from "../config/cache";

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id as string;
    const { rating, comment } = req.body as {
      rating?: number;
      comment?: string;
    };

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!rating || !comment) {
      res.status(400).json({ message: "Rating and comment are required" });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    // Check if user has already reviewed this listing
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.userId,
        listingId
      }
    });

    if (existingReview) {
      res.status(400).json({ message: "You have already reviewed this listing" });
      return;
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: req.userId,
        listingId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Clear cache for this listing's reviews
    deleteCacheByPrefix(`reviews:listing:${listingId}`);
    
    // Update listing's average rating
    const reviews = await prisma.review.findMany({
      where: { listingId },
      select: { rating: true }
    });
    
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await prisma.listing.update({
      where: { id: listingId },
      data: { rating: Math.round(averageRating * 10) / 10 } // Round to 1 decimal place
    });

    res.status(201).json(review);
  } catch (error) {
    handleControllerError(error, res, "reviews.createReview");
  }
};

export const getListingReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({ message: "Invalid pagination parameters" });
      return;
    }

    // Generate cache key
    const cacheKey = generateCacheKey(`reviews:listing:${listingId}`, { page, limit });
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    // Fetch reviews and count in parallel
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { listingId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      }),
      prisma.review.count({ where: { listingId } })
    ]);

    const totalPages = Math.ceil(total / limit);

    const result = {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    };

    // Cache for 30 seconds
    setCache(cacheKey, result, 30);

    res.json(result);
  } catch (error) {
    handleControllerError(error, res, "reviews.getListingReviews");
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviewId = req.params.id as string;

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { listing: true }
    });

    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    // Check if user owns the review or is admin
    if (review.userId !== req.userId && req.role !== "ADMIN") {
      res.status(403).json({ message: "You can only delete your own reviews" });
      return;
    }

    // Delete the review
    await prisma.review.delete({ where: { id: reviewId } });

    // Clear cache for this listing's reviews
    deleteCacheByPrefix(`reviews:listing:${review.listingId}`);

    // Recalculate listing's average rating
    const remainingReviews = await prisma.review.findMany({
      where: { listingId: review.listingId },
      select: { rating: true }
    });

    let newRating = null;
    if (remainingReviews.length > 0) {
      const averageRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length;
      newRating = Math.round(averageRating * 10) / 10;
    }

    await prisma.listing.update({
      where: { id: review.listingId },
      data: { rating: newRating }
    });

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    handleControllerError(error, res, "reviews.deleteReview");
  }
};