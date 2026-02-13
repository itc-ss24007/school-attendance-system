import express from "express";
import session from "express-session";
import passport from "passport";
import "./auth/passport.js"; // ← Passport設定を読み込む
import authRoutes from "@/routes/auth.routes.js";
import majorRoutes from "@/routes/major.js";
import attendanceRoutes from "@/routes/attendance.js"
import studentRoutes from "@/routes/student.js"
import syncRouter from "@/routes/sync.js"
import cors from "cors";
import {RedisStore} from "connect-redis";
import { createClient } from "redis";

const app = express();

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.connect().catch(console.error);

app.use(
    cors({
        origin: ["http://localhost:3000",
            "https://school-attendance-system-nu.vercel.app"],
        credentials: true,
    })
);
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/**
 * セッション設定
 */
app.use(
    session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        proxy:true,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // 本番では true（https）
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 1000 * 60 * 60 * 2, // 2時間
        },
        store: new RedisStore({
            client: redisClient,
            prefix: "session:",
        }),
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/major', majorRoutes);
app.use('/attendance',attendanceRoutes);
app.use("/students", studentRoutes);
app.use("/sync", syncRouter);

export default app;
