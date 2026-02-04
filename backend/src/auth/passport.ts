import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/prisma.js";
import { checkUserRole } from "../services/checkUserRole.js";

/**
 * セッションに保存する情報
 * → user.id のみ保存（最小限）
 */
passport.serializeUser((user, done) => {
    done(null, user.id);
});

/**
 * セッションからユーザー情報を復元
 */
passport.deserializeUser(async (id:string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err);
    }
});

/**
 * Google OAuth Strategy
 */
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
            proxy: true,
        },
        /**
         * Googleログイン後に呼ばれる処理
         */
        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleId = profile.id;
                const email = profile.emails?.[0]?.value;
                const name = profile.displayName;
                if (!email) {
                    return done(new Error("No email found in Google profile"));
                }
                /**
                 * ① 既にDBにユーザーが存在するか確認
                 */
                let user = await prisma.user.findUnique({
                    where: { email },
                });

                /**
                 * ② 存在しない場合は Directory API で役割判定
                 */
                if (!user) {
                    const role = await checkUserRole(email); // student / teacher

                    user = await prisma.user.create({
                        data: {
                            googleId,
                            email,
                            name,
                            role,
                            studentNo:
                                role === "student"
                                    ? email.split('@')[0]
                                    : null,
                        },
                    });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);
