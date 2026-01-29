import { Request, Response, NextFunction } from "express";

/**
 * 教師権限必須ミドルウェア
 * ・ログイン済み
 * ・role === teacher
 */
export function requireTeacher(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({
            message: "ログインしてください",
        });
    }

    const user = req.user as any;

    if (user.role !== "teacher") {
        return res.status(403).json({
            message: "教師権限が必要です",
        });
    }

    next();
}
