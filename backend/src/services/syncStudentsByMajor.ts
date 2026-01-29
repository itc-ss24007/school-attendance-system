import { prisma } from "@/lib/prisma.js";
import { extractStudentNo } from "@/utils/extractStudentNo.js";

/**
 * 指定された学科学年（クラス）の学生一覧を同期する
 *
 * ・同期元は group_member テーブル
 * ・学籍番号は email の「@」以前を使用
 * ・氏名は fullName を使用
 * ・出席履歴保持のため学生データは削除しない
 *
 * 同期ルール：
 * ・今回の同期に存在する学生 → is_active = true
 * ・存在しない学生 → is_active = false
 *
 * @param majorId 学科学年ID（= groupId）
 */
export async function syncStudentsByMajor(majorId: string) {
    await prisma.$transaction(async (tx) => {
        /**
         * ① 同期対象のグループメンバーを取得
         */
        const members = await tx.groupMember.findMany({
            where: { groupId: majorId },
            select: {
                email: true,
                fullName: true,
            },
        });

        /**
         * ② 対象クラスの学生を一旦「非在籍」にする
         */
        await tx.student.updateMany({
            where: { majorId: majorId },
            data: { isActive: false },
        });

        /**
         * ③ 同期対象学生を登録・更新（在籍に戻す）
         */
        for (const member of members) {
            const studentNo = extractStudentNo(member.email);

            // 氏名が取得できない場合はスキップ
            if (!member.fullName) continue;

            await tx.student.upsert({
                where: { studentNo: studentNo },
                update: {
                    name: member.fullName,
                    majorId: majorId,
                    isActive: true,
                },
                create: {
                    studentNo: studentNo,
                    name: member.fullName,
                    majorId: majorId,
                    isActive: true,
                },
            });
        }
    });
}
