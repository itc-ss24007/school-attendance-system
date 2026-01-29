import { prisma } from "@/lib/prisma.js";
import { syncStudentsByMajor } from "@/services/syncStudentsByMajor.js";

/**
 * 全学科学年（クラス）の学生一覧を同期する
 *
 * ・DBに存在する学科学年を対象とする
 * ・group_member に登録されている学生を Student に反映
 * ・初回データ生成・検証用スクリプト
 */
async function main() {
    /**
     * ① 同期対象の学科学年を取得
     * 卒業済みフラグがある場合は除外
     */
    const majors = await prisma.majorGrade.findMany({
        where: { flag: false },
        select: { id: true, display_name: true },
    });

    console.log(`同期対象クラス数: ${majors.length}`);

    /**
     * ② クラスごとに学生一覧を同期
     */
    for (const major of majors) {
        console.log(`▶ 同期開始: ${major.display_name}`);
        await syncStudentsByMajor(major.id);
        console.log(`✔ 同期完了: ${major.display_name}`);
    }

    console.log("🎉 全クラスの学生同期が完了しました");
}

/**
 * スクリプト実行
 */
main()
    .catch((e) => {
        console.error("❌ 学生同期中にエラーが発生しました", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
