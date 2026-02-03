import { Router } from "express";
import { requireStudent } from "../middlewares/requireStudent.js";
import { prisma } from "@/lib/prisma.js";
import { AbsenceType } from "db";

const router = Router();

router.get("/me", requireStudent, async (req, res) => {
    const user = req.user as any;

    const student = await prisma.student.findUnique({
        where: { studentNo: user.studentNo },
        include: { major: true },
    });

    if (!student) {
        return res.status(404).json({ message: "学生情報が見つかりません" });
    }

    res.json({
        studentNo: student.studentNo,
        name: student.name,
        major: {
            majorName: student.major.majorName,
            grade: student.major.grade,
            displayName: student.major.displayName,
        },
    });
});

router.post("/absenceReport", requireStudent, async (req, res) => {
    try {
        const user = req.user as any;
        const { date, type, reason } = req.body;

        if (!date || !type) {
            return res.status(400).json({
                message: "日付とタイプは必須です",
            });
        }
        // 同日重複チェック
        const exists = await prisma.absenceReport.findFirst({
            where: {
                studentNo: user.studentNo,
                date: new Date(date),
            },
        });

        if (exists) {
            return res.status(409).json({
                message: "この日の連絡は既に送信されています",
            });
        }
        const record = await prisma.absenceReport.create({
            data: {
                studentNo: user.studentNo,
                date: new Date(date),
                type:
                    type === "欠席"
                        ? AbsenceType.absence
                        : type === "遅刻"
                            ? AbsenceType.late
                            : AbsenceType.early_leave,
                reason,
            },
        });

        res.status(201).json(record);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "欠席連絡の登録に失敗しました" });
    }
});

router.get("/absenceReport", requireStudent, async (req, res) => {
    try {
        const user = req.user as any;

        const reports = await prisma.absenceReport.findMany({
            where: {
                studentNo: user.studentNo,
            },
            orderBy: {
                date: "desc",
            },
        });

        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "履歴の取得に失敗しました" });
    }
});

export default router;
