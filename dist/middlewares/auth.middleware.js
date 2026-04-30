"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireGuest = exports.requireHost = exports.authenticate = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env["JWT_SECRET"];
const authenticate = (req, res, next) => {
    if (!JWT_SECRET) {
        res.status(500).json({ message: "JWT_SECRET is not configured" });
        return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "No token provided" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.authenticate = authenticate;
const requireHost = (req, res, next) => {
    if (req.role !== client_1.Role.HOST && req.role !== client_1.Role.ADMIN) {
        res.status(403).json({ message: "Only hosts can perform this action" });
        return;
    }
    next();
};
exports.requireHost = requireHost;
const requireGuest = (req, res, next) => {
    if (req.role !== client_1.Role.GUEST && req.role !== client_1.Role.ADMIN) {
        res.status(403).json({ message: "Only guests can perform this action" });
        return;
    }
    next();
};
exports.requireGuest = requireGuest;
const requireAdmin = (req, res, next) => {
    if (req.role !== client_1.Role.ADMIN) {
        res.status(403).json({ message: "Only admins can perform this action" });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
