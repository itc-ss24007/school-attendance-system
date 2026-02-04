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

const app = express();

app.use(
    cors({
        origin: ["http://localhost:3000",
            "https://school-attendance-system-nu.vercel.app"],
        credentials: true,
    })
);
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
        cookie: {
            httpOnly: true,
            secure: false, // 本番では true（https）
            maxAge: 1000 * 60 * 60 * 24, // 1日
        },
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
