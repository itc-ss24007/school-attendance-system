import express from "express";
import {prisma} from "@/lib/prisma.js"
import passport from "passport";

const router = express.Router();

/**
 * 学科・学年一覧取得
 * ・デフォルト：在学中のみ
 * ・includeGraduated=true の場合は卒業済みも含む
 */
router.get("/", async (req, res) => {
    const includeGraduated =
        req.query.includeGraduated === "true";

    try {
        const majors = await prisma.majorGrade.findMany({
            where: includeGraduated
                ? {}
                : { flag: false }, // flag=false：在学中
            orderBy: [
                { enrollYear: "desc" },
                { majorName: "asc" },
            ],
        });

        return res.status(200).json({ majors });
    } catch (err: any) {
        console.error(err);
        return res.status(400).json({ majors: [] });
    }
});

/**
 * 班级の卒業フラグ更新（前台操作）
 */
router.patch("/:id/graduated", async (req, res) => {
    const { id } = req.params;
    const { graduated } = req.body;

    if (typeof graduated !== "boolean") {
        return res.status(400).json({
            message: "graduated は boolean で指定してください",
        });
    }

    try {
        const major = await prisma.majorGrade.update({
            where: { id },
            data: {
                flag: graduated,
            },
        });

        return res.status(200).json({ major });
    } catch (err: any) {
        console.error(err);
        return res.status(400).json({ message: "更新失敗" });
    }
});

export default router;