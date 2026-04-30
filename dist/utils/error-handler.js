"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleControllerError = void 0;
const client_1 = require("@prisma/client");
const handleControllerError = (error, res, operation) => {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        console.error(`[${operation}] Prisma error ${error.code}: ${error.message}`);
        if (error.code === "P2002") {
            res.status(409).json({ message: "Duplicate value violates unique constraint" });
            return;
        }
        if (error.code === "P2025") {
            res.status(404).json({ message: "Record not found" });
            return;
        }
        if (error.code === "P2003") {
            res.status(400).json({ message: "Invalid related record reference" });
            return;
        }
    }
    console.error(`[${operation}] Unexpected error:`, error);
    res.status(500).json({ message: "Something went wrong" });
};
exports.handleControllerError = handleControllerError;
