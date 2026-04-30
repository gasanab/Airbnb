"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deprecateV1 = deprecateV1;
/**
 * Deprecation middleware for API v1
 * Adds deprecation headers to inform clients that v1 will be sunset
 */
function deprecateV1(_req, res, next) {
    // Add deprecation headers
    res.setHeader("Deprecation", "true");
    res.setHeader("Sunset", "Sat, 01 Jan 2027 00:00:00 GMT");
    res.setHeader("Link", '</api/v2>; rel="successor-version"');
    next();
}
