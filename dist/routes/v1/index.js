"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const users_routes_1 = __importDefault(require("./users.routes"));
const listings_routes_1 = __importDefault(require("./listings.routes"));
const bookings_routes_1 = __importDefault(require("./bookings.routes"));
const reviews_routes_1 = __importDefault(require("./reviews.routes"));
const stats_routes_1 = __importDefault(require("./stats.routes"));
const upload_routes_1 = __importDefault(require("./upload.routes"));
const v1Router = (0, express_1.Router)();
// Mount all v1 routes
v1Router.use("/auth", auth_routes_1.default);
v1Router.use("/users", users_routes_1.default);
v1Router.use("/listings", listings_routes_1.default);
v1Router.use("/bookings", bookings_routes_1.default);
v1Router.use("/stats", stats_routes_1.default);
v1Router.use("/", reviews_routes_1.default); // Reviews routes are nested under listings
v1Router.use("/", upload_routes_1.default);
exports.default = v1Router;
