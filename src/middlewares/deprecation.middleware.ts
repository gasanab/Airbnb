import type { Request, Response, NextFunction } from "express";

/**
 * Deprecation middleware for API v1
 * Adds deprecation headers to inform clients that v1 will be sunset
 */
export function deprecateV1(_req: Request, res: Response, next: NextFunction): void {
  // Add deprecation headers
  res.setHeader("Deprecation", "true");
  res.setHeader("Sunset", "Sat, 01 Jan 2027 00:00:00 GMT");
  res.setHeader("Link", '</api/v2>; rel="successor-version"');
  
  next();
}
