"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserSchema = exports.updateUserSchema = exports.createUserSchema = exports.getUserBookingsSchema = exports.getUserListingsSchema = exports.getUserByIdSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.getUserByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "ID must be a valid number")
    })
});
exports.getUserListingsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "ID must be a valid number")
    })
});
exports.getUserBookingsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "ID must be a valid number")
    })
});
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required"),
        email: zod_1.z.string().email("Invalid email format"),
        username: zod_1.z.string().min(3, "Username must be at least 3 characters"),
        phone: zod_1.z.string().min(10, "Phone number must be at least 10 characters"),
        password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
        role: zod_1.z.nativeEnum(client_1.Role).optional(),
        avatar: zod_1.z.string().url("Avatar must be a valid URL").optional(),
        bio: zod_1.z.string().optional()
    })
});
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "ID must be a valid number")
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        email: zod_1.z.string().email().optional(),
        username: zod_1.z.string().min(3).optional(),
        phone: zod_1.z.string().min(10).optional(),
        password: zod_1.z.string().min(8).optional(),
        role: zod_1.z.nativeEnum(client_1.Role).optional(),
        avatar: zod_1.z.string().url().optional(),
        bio: zod_1.z.string().optional()
    })
});
exports.deleteUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "ID must be a valid number")
    })
});
