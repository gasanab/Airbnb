import { BookingStatus } from "@prisma/client";
import { z } from "zod";

export const getBookingByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a valid number")
  })
});

export const createBookingSchema = z.object({
  body: z.object({
    listingId: z.number().int().positive("Listing ID must be a positive integer"),
    checkIn: z.string().datetime("checkIn must be a valid ISO date"),
    checkOut: z.string().datetime("checkOut must be a valid ISO date")
  })
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a valid number")
  }),
  body: z.object({
    status: z.nativeEnum(BookingStatus)
  })
});

export const deleteBookingSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a valid number")
  })
});
