import { Router } from "express";
import { createAttendanceSheet } from "../services/createAttendanceSheet.js";
//import { requireAuth } from "../middlewares/requireAuth.js";
import { prisma } from "@/lib/prisma.js"

const router = Router();

/**
 * GET /api/attendance/today?majorId=xxx
 * 当日の出席簿取得（学生名を含めて取得）
 */
router.get("/today", async (req, res) => {
    try {
        const { majorId } = req.query;

        if (!majorId || typeof majorId !== "string") {
            return res.status(400).json({ message: "majorId is required" });
        }

        // 当日 00:00:00 の時間設定
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Prismaで出席レコードを取得し、学生情報をJOINする
        const records = await prisma.attendanceRecord.findMany({
            where: {
                majorId,
                date: today,
            },
            include: {
                // 学生テーブルから氏名を取得（リレーション名を確認してください）
                student: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                studentNo: "asc",
            },
        });

        // フロントエンドが扱いやすいようにデータを整形
        const formattedRecords = records.map((record) => ({
            studentNo: record.studentNo,
            // 学生名を取得（リレーション先がない場合は '未登録'）
            studentName: record.student?.name || "未登録",
            period1: record.period1,
            period2: record.period2,
            period3: record.period3,
            period4: record.period4,
            majorId: record.majorId,
            date: record.date,
        }));

        res.json({
            date: today.toISOString().slice(0, 10),
            records: formattedRecords,
        });
    } catch (e) {
        console.error("出席簿取得エラー:", e);
        res.status(500).json({ message: "failed to fetch attendance" });
    }
});
/**
 * PUT /attendance/update
 * 出席簿の一括更新
 */
router.put("/update", async (req, res) => {
    try {
        const { majorId, records } = req.body;

        // バリデーション
        if (!majorId || !Array.isArray(records)) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        // トランザクションを使用して一括更新
        // 1つでも失敗すると全ての変更がキャンセルされるため安全です
        await prisma.$transaction(
            records.map((record: any) =>
                prisma.attendanceRecord.update({
                    where: {
                        // schema.prisma の @@unique([majorId, studentNo, date]) に基づく
                        majorId_studentNo_date: {
                            majorId: majorId,
                            studentNo: record.studentNo,
                            date: new Date(record.date || new Date().setHours(0,0,0,0)),
                        },
                    },
                    data: {
                        period1: record.period1,
                        period2: record.period2,
                        period3: record.period3,
                        period4: record.period4,
                        updatedBy: "teacher-id", // 本来は認証済みユーザーIDを入れる
                    },
                })
            )
        );

        res.json({ message: "Attendance updated successfully" });
    } catch (e) {
        console.error("更新エラー:", e);
        res.status(500).json({ message: "Failed to update attendance" });
    }
});
/**
 * 出席簿作成
 * POST /attendance/create
 */
router.post("/create"//, requireAuth
    , async (req, res) => {
    const { majorId, date } = req.body;

    if (!majorId || !date) {
        return res.status(400).json({
            message: "パラメータが不足しています",
        });
    }

    try {
       // const teacherId = req.user.id; // ← 認証middlewareから取得
        const teacherId = 'test'
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        await createAttendanceSheet(
            majorId,
            targetDate,
            teacherId
        );

        return res.status(201).json({
            message: "出席簿を作成しました",
        });
    } catch (err: any) {
        console.error(err);

        if (err.message === "ATTENDANCE_ALREADY_EXISTS") {
            return res.status(409).json({
                message: "既に当日の出席簿が存在します",
            });
        }

        if (err.message === "NO_ACTIVE_STUDENTS") {
            return res.status(400).json({
                message: "在籍中の学生が存在しません",
            });
        }

        return res.status(500).json({
            message: "出席簿作成に失敗しました",
        });
    }
});

export default router;
