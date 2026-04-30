"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserBookings = exports.getUserListings = exports.getUserById = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../config/prisma"));
const error_handler_1 = require("../utils/error-handler");
const sanitizeUser = (user) => {
    if ("password" in user) {
        const { password: _password, ...rest } = user;
        return rest;
    }
    return user;
};
const getAllUsers = async (_req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            include: { _count: { select: { listings: true } } }
        });
        res.status(200).json(users.map((user) => sanitizeUser(user)));
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "users.getAllUsers");
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await prisma_1.default.user.findUnique({
            where: { id },
            include: { listings: true, bookings: true }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(sanitizeUser(user));
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "users.getUserById");
    }
};
exports.getUserById = getUserById;
const getUserListings = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const listings = await prisma_1.default.listing.findMany({ where: { hostId: userId } });
        res.status(200).json(listings);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "users.getUserListings");
    }
};
exports.getUserListings = getUserListings;
const getUserBookings = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const bookings = await prisma_1.default.booking.findMany({
            where: { guestId: userId },
            include: { listing: true }
        });
        res.status(200).json(bookings);
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "users.getUserBookings");
    }
};
exports.getUserBookings = getUserBookings;
const createUser = async (req, res) => {
    try {
        const { name, email, username, phone, role, password, avatar, bio } = req.body;
        if (!name || !email || !username || !phone || !password) {
            res.status(400).json({ message: "Missing required user fields" });
            return;
        }
        const existingUser = await prisma_1.default.user.findFirst({ where: { email } });
        if (existingUser) {
            res.status(409).json({ message: "Email already exists" });
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
        res.status(201).json(sanitizeUser(user));
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "users.createUser");
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const existingUser = await prisma_1.default.user.findFirst({ where: { id } });
        if (!existingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (req.body.password) {
            req.body.password = await bcrypt_1.default.hash(String(req.body.password), 10);
        }
        const user = await prisma_1.default.user.update({
            where: { id },
            data: req.body
        });
        res.status(200).json(sanitizeUser(user));
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "users.updateUser");
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const existingUser = await prisma_1.default.user.findFirst({ where: { id } });
        if (!existingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        await prisma_1.default.user.delete({ where: { id } });
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        (0, error_handler_1.handleControllerError)(error, res, "users.deleteUser");
    }
};
exports.deleteUser = deleteUser;
