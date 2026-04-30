"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.getMe = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const email_1 = require("../config/email");
const error_handler_1 = require("../utils/error-handler");
const emails_1 = require("../templates/emails");
const JWT_SECRET = process.env["JWT_SECRET"];
const omitPassword = (user) => {
    const { password: _password, ...rest } = user;
    return rest;
};
const register = async (req, res) => {
    try {
        const { name, email, username, phone, password, role, avatar, bio } = req.body;
        if (!name || !email || !username || !phone || !password) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({ message: "Password must be at least 8 characters" });
            return;
        }
        if (role === client_1.Role.ADMIN) {
            res.status(403).json({ message: "You cannot self-assign ADMIN role" });
            return;
        }
        const existing = await prisma_1.default.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });
        if (existing) {
            res.status(409).json({ message: "Email or username already in use" });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                name,
                email,
                username,
                phone,
                password: hashedPassword,
                role: role ?? client_1.Role.GUEST,
                avatar,
                bio
            }
        });
        // Send welcome email asynchronously - don't block response on email failure
        (0, email_1.sendEmail)(email, "Welcome to Airbnb!", (0, emails_1.welcomeEmail)(name, (role ?? client_1.Role.GUEST).toLowerCase())).catch(error => {
            console.error("Failed to send welcome email:", error);
        });
        res.status(201).json(omitPassword(user));
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "auth.register");
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        if (!JWT_SECRET) {
            res.status(500).json({ message: "JWT_SECRET is not configured" });
            return;
        }
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ token, user: omitPassword(user) });
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "auth.login");
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.userId || !req.role) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
            include: {
                listings: req.role === client_1.Role.HOST || req.role === client_1.Role.ADMIN,
                bookings: req.role === client_1.Role.GUEST || req.role === client_1.Role.ADMIN
            }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(omitPassword(user));
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "auth.getMe");
    }
};
exports.getMe = getMe;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!req.userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: "currentPassword and newPassword are required" });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({ message: "New password must be at least 8 characters" });
            return;
        }
        const user = await prisma_1.default.user.findUnique({ where: { id: req.userId } });
        if (!user || !user.password) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Current password is incorrect" });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({ where: { id: req.userId }, data: { password: hashedPassword } });
        res.status(200).json({ message: "Password changed successfully" });
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "auth.changePassword");
    }
};
exports.changePassword = changePassword;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const successResponse = { message: "If that email is registered, a reset link has been sent" };
        if (!email) {
            res.status(200).json(successResponse);
            return;
        }
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(200).json(successResponse);
            return;
        }
        const rawToken = crypto_1.default.randomBytes(32).toString("hex");
        const hashedToken = crypto_1.default.createHash("sha256").update(rawToken).digest("hex");
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                resetToken: hashedToken,
                resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000)
            }
        });
        // Send password reset email asynchronously
        const resetLink = `${process.env.API_URL || "http://localhost:3000"}/auth/reset-password/${rawToken}`;
        (0, email_1.sendEmail)(email, "Reset Your Password", (0, emails_1.passwordResetEmail)(user.name, resetLink)).catch(error => {
            console.error("Failed to send password reset email:", error);
        });
        res.status(200).json(successResponse);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "auth.forgotPassword");
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const token = req.params.token;
        const { password } = req.body;
        if (!token || !password || password.length < 8) {
            res.status(400).json({ message: "Password must be at least 8 characters" });
            return;
        }
        const hashedToken = crypto_1.default.createHash("sha256").update(String(token)).digest("hex");
        const user = await prisma_1.default.user.findFirst({
            where: {
                resetToken: hashedToken,
                resetTokenExpiry: { gt: new Date() }
            }
        });
        if (!user) {
            res.status(400).json({ message: "Invalid or expired reset token" });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "auth.resetPassword");
    }
};
exports.resetPassword = resetPassword;
