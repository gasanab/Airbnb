"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
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
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format"),
        password: zod_1.z.string().min(1, "Password is required")
    })
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, "Current password is required"),
        newPassword: zod_1.z.string().min(8, "New password must be at least 8 characters")
    })
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format")
    })
});
exports.resetPasswordSchema = zod_1.z.object({
    params: zod_1.z.object({
        token: zod_1.z.string().min(1, "Token is required")
    }),
    body: zod_1.z.object({
        password: zod_1.z.string().min(8, "Password must be at least 8 characters")
    })
});
