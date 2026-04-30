"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBookingSchema = exports.updateBookingStatusSchema = exports.createBookingSchema = exports.getBookingByIdSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.getBookingByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "ID must be a valid number")
    })
});
exports.createBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        listingId: zod_1.z.number().int().positive("Listing ID must be a positive integer"),
        checkIn: zod_1.z.string().datetime("checkIn must be a valid ISO date"),
        checkOut: zod_1.z.string().datetime("checkOut must be a valid ISO date")
    })
});
exports.updateBookingStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "ID must be a valid number")
    }),
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.BookingStatus)
    })
});
exports.deleteBookingSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "ID must be a valid number")
    })
});
