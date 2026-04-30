import { Router } from "express";
import authRouter from "./auth.routes";
import usersRouter from "./users.routes";
import listingsRouter from "./listings.routes";
import bookingsRouter from "./bookings.routes";
import reviewsRouter from "./reviews.routes";
import statsRouter from "./stats.routes";
import uploadRouter from "./upload.routes";

const v1Router = Router();

// Mount all v1 routes
v1Router.use("/auth", authRouter);
v1Router.use("/users", usersRouter);
v1Router.use("/listings", listingsRouter);
v1Router.use("/bookings", bookingsRouter);
v1Router.use("/stats", statsRouter);
v1Router.use("/", reviewsRouter); // Reviews routes are nested under listings
v1Router.use("/", uploadRouter);

export default v1Router;