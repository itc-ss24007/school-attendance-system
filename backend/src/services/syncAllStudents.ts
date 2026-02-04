import { prisma } from "@/lib/prisma.js";
import { syncStudentsByMajor } from "@/services/syncStudentsByMajor.js";

/**
 * 全学科学年（クラス）の学生一覧を同期する
 *
 * ・DBに存在する学科学年を対象とする
 * ・卒業済み（flag = true）は除外
 * ・group_member を元に Student を同期
 */
export async function syncAllStudents() {
    /**
     * ① 同期対象の学科学年を取得
     */
    const majors = await prisma.majorGrade.findMany({
        where: { flag: false },
        select: { id: true, displayName: true },
    });

    console.log(`同期対象クラス数: ${majors.length}`);

    /**
     * ② クラスごとに学生一覧を同期
     */
    for (const major of majors) {
        console.log(`▶ 同期開始: ${major.displayName}`);
        await syncStudentsByMajor(major.id);
        console.log(`✔ 同期完了: ${major.displayName}`);
    }

    console.log("🎉 全クラスの学生同期が完了しました");
}
