import { Request, Response } from "express";
import prisma from "../config/prisma";
import { handleControllerError } from "../utils/error-handler";
import { getCache, setCache } from "../config/cache";

export const getListingStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = "stats:listings";
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    // Fetch all stats in parallel
    const [
      totalListings,
      averagePriceResult,
      byLocation,
      byType
    ] = await Promise.all([
      // Total count of listings
      prisma.listing.count(),
      
      // Average price
      prisma.listing.aggregate({
        _avg: {
          pricePerNight: true
        }
      }),
      
      // Count by location
      prisma.listing.groupBy({
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
      prisma.listing.groupBy({
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
    setCache(cacheKey, result, 300);

    res.json(result);
  } catch (error) {
    handleControllerError(error, res, "stats.getListingStats");
  }
};

export const getUserStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = "stats:users";
    
    // Check cache first
    const cached = getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    // Fetch user stats in parallel
    const [totalUsers, byRole] = await Promise.all([
      // Total count of users
      prisma.user.count(),
      
      // Count by role
      prisma.user.groupBy({
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
    setCache(cacheKey, result, 300);

    res.json(result);
  } catch (error) {
    handleControllerError(error, res, "stats.getUserStats");
  }
};