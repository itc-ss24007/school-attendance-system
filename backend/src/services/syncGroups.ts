import { directory } from "../config/google.js";
import { prisma } from "../lib/prisma.js";

/**
 * Google Groups の情報をローカルデータベースと同期する
 */
export async function syncGroups() {
    console.log("Google Groups の同期を開始します...");

    let pageToken: string | undefined;
    let totalSynced = 0;

    try {
        do {
            // 1. Google Directory API からグループ一覧を取得（ページネーション対応）
            const res = await directory.groups.list({
                customer: "my_customer",
                maxResults: 200,
                pageToken: pageToken,
            });

            const groups = res.data.groups ?? [];

            // ❌ Promise.all をやめる
            for (const g of groups) {
                if (!g.id || !g.email) continue;
                if (g.directMembersCount === "0") continue;

                await prisma.group.upsert({
                    where: { id: g.id },
                    update: {
                        email: g.email,
                        name: g.name ?? "名称未設定",
                        directMembersCount: Number(g.directMembersCount ?? 0),
                        description: g.description,
                    },
                    create: {
                        id: g.id,
                        email: g.email,
                        name: g.name ?? "名称未設定",
                        directMembersCount: Number(g.directMembersCount ?? 0),
                        description: g.description,
                    },
                });
            }


            totalSynced += groups.length;
            // 次のページのトークンをセット
            pageToken = res.data.nextPageToken ?? undefined;

        } while (pageToken);

        console.log(`同期が正常に完了しました。合計: ${totalSynced} 件`);
    } catch (error) {
        console.error("同期中にエラーが発生しました:", error);
        throw error;
    }
}