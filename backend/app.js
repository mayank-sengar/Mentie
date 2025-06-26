import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

// Simple request logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

import authRoutes from "./src/routes/auth.routes.js";
import mentorRoutes from "./src/routes/mentor.routes.js";
import bookingRoutes from "./src/routes/booking.routes.js";

// http://localhost:8000/api/v1/
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/mentor", mentorRoutes);
app.use("/api/v1/booking", bookingRoutes);



export { app }