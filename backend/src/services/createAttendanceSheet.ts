import { prisma } from "../lib/prisma.js";
import { AttendanceStatus } from 'db'

/**
 * 出席簿作成サービス
 * ・指定クラス・指定日付の出席簿を生成
 * ・既に存在する場合は作成しない
 */
export async function createAttendanceSheet(
    majorId: string,
    targetDate: Date,
    teacherId: string
) {
    /**
     * ① 既に当日の出席簿が存在するか確認
     */
    const exists = await prisma.attendanceRecord.findFirst({
        where: {
            majorId: majorId,
            date: targetDate,
        },
    });

    if (exists) {
        throw new Error("ATTENDANCE_ALREADY_EXISTS");
    }

    /**
     * ② 在籍学生一覧取得
     */
    const students = await prisma.student.findMany({
        where: {
            majorId: majorId,
            isActive: true, // 在籍中のみ
        },
        select: {
            studentNo: true,
        },
    });

    if (students.length === 0) {
        throw new Error("NO_ACTIVE_STUDENTS");
    }

    /**
     * ③ 出席レコード生成データ作成
     */
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.attendanceRecord.createMany({
        data: students.map((s) => ({
            majorId,
            studentNo: s.studentNo,
            date: today,
            updatedBy: teacherId,
            period1: AttendanceStatus.present,
            period2: AttendanceStatus.present,
            period3: AttendanceStatus.present,
            period4: AttendanceStatus.present,
        })),
    });
}
