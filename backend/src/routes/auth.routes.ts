import express from "express";
import passport from "passport";

const router = express.Router();

/**
 * Google OAuth ログイン開始
 *
 * Google の認証画面へリダイレクトする。
 * scope で profile / email を要求する。
 */
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

/**
 * Google OAuth コールバック
 */
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: process.env.FRONTEND_URL ||"http://localhost:3000/",
    }),
    (req, res) => {
        res.redirect(process.env.FRONTEND_URL ||"http://localhost:3000/");
    }
);

router.get("/me", (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Not logged in" });
    }

    const user = req.user as any;

    res.json({
        loggedIn: true,
        user: {
            id: user.id,
            name: user.name,
            role: user.role,
            groups: user.groups,
        },
    });
});

/**
 * ログアウト処理
 *
 * セッションを破棄し、ログアウトする。
 */
router.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.sendStatus(200);
    });
});

export default router;
