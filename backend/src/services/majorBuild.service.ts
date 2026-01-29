import { prisma } from "../lib/prisma.js";
import { calcGrade } from "@/utils/calcGrade.js";

export async function syncMajorGrades() {
    // 学科候補となるグループを取得（メンバー込み）
    const groups = await prisma.group.findMany({
        where: {
            description: {
                not: null,
            },
        },
        include: {
            members: true, // GroupMember を同時取得
        },
    });

    for (const group of groups) {
        // メンバーが存在しないグループは対象外
        if (group.members.length === 0) {
            continue;
        }

        // 学科・コース判定
        // 例：2023年度入学 ITスペシャリスト科
        const match = group.description!.match(
            /^(\d{4})年度入学\s+(.+?(科|コース))$/
        );
        if (!match) {
            continue;
        }

        const enrollYear = Number(match[1]); // 入学年度
        const majorName = match[2];          // 学科名
        const grade = calcGrade(enrollYear); // 学年自動計算

        // 既存データ取得
        const existing = await prisma.majorGrade.findUnique({
            where: { id: group.id },
        });

        // 既に卒業済みの場合は更新しない
        if (existing && existing.flag === true) {
            continue;
        }

        await prisma.majorGrade.upsert({
            where: {
                id: group.id, // Group ID を学科IDとして利用
            },
            update: {
                majorName: majorName,
                enrollYear: enrollYear,
                grade: grade,
                displayName: `${group.description} ${grade}年生`,
                // flag は同期処理では変更しない
            },
            create: {
                id: group.id,
                majorName: majorName,
                enrollYear: enrollYear,
                grade: grade,
                displayName: `${group.description} ${grade}年生`,
                flag: false, // 卒業管理フラグ 初期は在籍中
            },
        });
    }
}
