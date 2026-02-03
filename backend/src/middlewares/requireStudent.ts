import { Request, Response, NextFunction } from "express";

export function requireStudent(
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

    if (user.role !== "student") {
        return res.status(403).json({
            message: "学生権限が必要です",
        });
    }

    next();
}
