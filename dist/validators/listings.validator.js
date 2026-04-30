"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteListingSchema = exports.updateListingSchema = exports.createListingSchema = exports.getListingByIdSchema = exports.getAllListingsSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.getAllListingsSchema = zod_1.z.object({
    query: zod_1.z.object({
        location: zod_1.z.string().optional(),
        type: zod_1.z.nativeEnum(client_1.ListingType).optional(),
        maxPrice: zod_1.z.string().regex(/^\d+(\.\d+)?$/, "maxPrice must be a valid number").optional(),
        page: zod_1.z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
        limit: zod_1.z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
        sortBy: zod_1.z.enum(["pricePerNight", "createdAt"]).optional(),
        order: zod_1.z.enum(["asc", "desc"]).optional()
    })
});
exports.getListingByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "ID must be a valid number")
    })
});
exports.createListingSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Title is required"),
        description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
        location: zod_1.z.string().min(1, "Location is required"),
        pricePerNight: zod_1.z.number().positive("Price per night must be positive"),
        guests: zod_1.z.number().int().positive("Guests must be a positive integer"),
        type: zod_1.z.nativeEnum(client_1.ListingType),
        amenities: zod_1.z.array(zod_1.z.string()).min(1, "At least one amenity is required"),
        rating: zod_1.z.number().min(0).max(5).optional()
    })
});
exports.updateListingSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "ID must be a valid number")
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().min(10).optional(),
        location: zod_1.z.string().min(1).optional(),
        pricePerNight: zod_1.z.number().positive().optional(),
        guests: zod_1.z.number().int().positive().optional(),
        type: zod_1.z.nativeEnum(client_1.ListingType).optional(),
        amenities: zod_1.z.array(zod_1.z.string()).optional(),
        rating: zod_1.z.number().min(0).max(5).optional(),
        hostId: zod_1.z.number().optional()
    })
});
exports.deleteListingSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "ID must be a valid number")
    })
});
