import { Router } from "express";
import { createAttendanceSheet } from "../services/createAttendanceSheet.js";
import { requireTeacher } from "../middlewares/requireTeacher.js";
import { prisma } from "@/lib/prisma.js"

const router = Router();

/**
 * 指定された日付を「00:00:00」に正規化する共通関数
 *
 * 理由：
 * PrismaのDate比較は「完全一致」になるため、
 * 時刻が含まれていると一致しなくなる可能性がある。
 *
 * 例：
 * 2026-02-10 00:00:00 ← DBに保存
 * 2026-02-10 13:45:22 ← これだと一致しない
 *
 * そのため必ず 00:00:00 に揃える
 */
function normalizeDate(dateStr: string) {
    // dateStr が "2026-02-10" の場合、"2026-02-10T00:00:00Z" とすることで
    // どの環境で実行しても UTC 00:00 として解釈される
    const d = new Date(`${dateStr}T00:00:00Z`);
    return d;
}

/**
 * ==========================================
 * 出席簿取得API
 * ==========================================
 *
 * GET /api/attendance?majorId=xxx&date=yyyy-mm-dd
 *
 * ■ 機能
 * 指定されたクラス・日付の出席簿を取得する
 *
 * ■ パラメータ
 * majorId : 必須（学科・学年ID）
 * date    : 任意（未指定の場合は当日）
 *
 * ■ 戻り値
 * ・指定日の出席データ一覧
 * ・学生名もJOINして返却
 *
 * ■ 想定用途
 * ・今日の出席確認
 * ・過去日の出席履歴表示
 * ・補入力画面
 */
router.get("/", requireTeacher,async (req, res) => {
    try {
        const { majorId, date } = req.query;

        // majorId は必須
        if (!majorId || typeof majorId !== "string") {
            return res.status(400).json({ message: "majorId is required" });
        }

        // 日付が指定されていればそれを使用、なければ日本時間の「今日」を生成
        let dateStr = date as string;
        if (!dateStr) {
            dateStr = new Intl.DateTimeFormat("ja-JP", {
                year: "numeric", month: "2-digit", day: "2-digit",
                timeZone: "Asia/Tokyo"
            }).format(new Date()).replace(/\//g, "-");
        }

        const targetDate = normalizeDate(dateStr);

        //console.log('targetDate', targetDate);
        //欠席届を取得
        const reports = await prisma.absenceReport.findMany({
            where: {
                date: targetDate,
            },
            select: {
                studentNo: true,
                type: true,
                reason: true,
                createdAt: true,
            },
        });

        // studentNo → reports[]
        const reportMap = new Map<string, typeof reports>();

        for (const r of reports) {
            if (!reportMap.has(r.studentNo)) {
                reportMap.set(r.studentNo, []);
            }
            reportMap.get(r.studentNo)!.push(r);
        }


        // 出席データ取得（学生名もJOIN）
        const records = await prisma.attendanceRecord.findMany({
            where: {
                majorId,
                date: targetDate,
            },
            include: {
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

        // フロント用に整形
        const formattedRecords = records.map((record) => {
            const studentReports = reportMap.get(record.studentNo) || [];

            return {
                studentNo: record.studentNo,
                studentName: record.student?.name || "未登録",
                period1: record.period1,
                period2: record.period2,
                period3: record.period3,
                period4: record.period4,
                majorId: record.majorId,
                date: record.date,

                absenceReports: studentReports,
                hasAbsenceReport: studentReports.length > 0,
            };
        });


        res.json({
            date: targetDate.toISOString().slice(0, 10),
            count: formattedRecords.length,
            records: formattedRecords,
        });
    } catch (e) {
        console.error("出席簿取得エラー:", e);
        res.status(500).json({ message: "failed to fetch attendance" });
    }
});

/**
 * ==========================================
 * 出席簿一括更新API
 * ==========================================
 *
 * PUT /api/attendance/update
 *
 * ■ 機能
 * 1日分の出席データをまとめて更新する
 *
 * ■ リクエスト例
 * {
 *   majorId: "xxx",
 *   date: "2026-02-10",
 *   records: [
 *     {
 *       studentNo: "A001",
 *       period1: "present",
 *       period2: "late",
 *       ...
 *     }
 *   ]
 * }
 *
 * ■ 特徴
 * ・トランザクションで一括更新
 * ・1件でも失敗すると全体ロールバック
 *
 * ■ 使用しているユニークキー
 * @@unique([majorId, studentNo, date])
 *
 * → この3つで「1人1日1レコード」を保証
 */
router.put("/update", requireTeacher,async (req, res) => {
    try {
        const { majorId, date, records } = req.body;

        if (!majorId || !Array.isArray(records)) {
            return res.status(400).json({ message: "Invalid request data" });
        }
        const teacherId = (req.user as any)!.id;
        const targetDate = normalizeDate(date);

        // トランザクションで全員分をまとめて更新
        await prisma.$transaction(
            records.map((record: any) =>
                prisma.attendanceRecord.update({
                    where: {
                        majorId_studentNo_date: {
                            majorId,
                            studentNo: record.studentNo,
                            date: targetDate,
                        },
                    },
                    data: {
                        period1: record.period1,
                        period2: record.period2,
                        period3: record.period3,
                        period4: record.period4,
                        updatedBy: teacherId, // ログインユーザーIDを使用
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
 * ==========================================
 * 出席簿作成API
 * ==========================================
 *
 * POST /api/attendance/create
 *
 * ■ 機能
 * 指定されたクラス・日付の出席簿を新規生成
 *
 * ■ 処理内容
 * ・在籍中の学生一覧を取得
 * ・全員分の出席レコードを生成（初期値：present）
 *
 * ■ バリデーション
 * ・同じ日付の出席簿が既に存在 → 作成しない
 * ・在籍学生がいない → 作成しない
 *
 * ■ リクエスト例
 * {
 *   majorId: "xxx",
 *   date: "2026-02-10"
 * }
 */
router.post("/create", requireTeacher,async (req, res) => {
    const { majorId, date } = req.body;

    if (!majorId || !date) {
        return res.status(400).json({
            message: "パラメータが不足しています",
        });
    }

    try {
        const teacherId = (req.user as any)!.id; // 認証情報から取得
        const targetDate = normalizeDate(date);

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
                message: "既にこの日の出席簿が存在します",
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
