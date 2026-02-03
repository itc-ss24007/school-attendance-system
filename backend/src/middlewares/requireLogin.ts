import { Request, Response, NextFunction } from "express";

/**
 * 認証必須ミドルウェア
 * ・ログイン済みユーザーのみアクセス可能
 */
export function requireLogin(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // passport が session にユーザーを保持しているか確認
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }

    return res.status(401).json({
        message: "認証が必要です",
    });
}
