import { directory } from "../config/google.js";
import { prisma } from "../lib/prisma.js";

/**
 * Google Group Member をローカル DB に同期する
 * - USER タイプのみ対象
 * - 特定の Group ID は除外
 * - ユーザー名は Directory API（users.get）から取得
 */
export async function syncGroupMembers() {
    console.log("Google Group Member の同期を開始します...");

    // 除外する Group ID
    const EXCLUDED_GROUP_IDS = new Set([
        "00rjefff0hzf3wu",//すべての卒業生(本科) 2008年度から
        "03znysh721ocn1s",//すべての卒業生(留学過程)
    ]);

    try {
        // 1. 同期対象の Group を DB から取得
        const groups = await prisma.group.findMany({
            where: {
                id: {
                    notIn: Array.from(EXCLUDED_GROUP_IDS),
                },
            },
        });

        console.log(`対象 Group 数: ${groups.length}`);

        let totalMembers = 0;

        // 2. Group ごとに Member を取得（直列処理で安全に）
        for (const group of groups) {
            console.log(`▶ Group 同期中: ${group.email}`);

            let pageToken: string | undefined;

            do {
                // 3. Group Member 一覧取得
                const res = await directory.members.list({
                    groupKey: group.email,
                    maxResults: 200,
                    pageToken,
                });

                const members = res.data.members ?? [];

                // 4. USER のみ処理
                for (const member of members) {
                    // USER かつ MEMBER ロールのみ同期対象
                    if (member.type !== "USER") continue;
                    if (member.role !== "MEMBER") continue;
                    if (!member.email) continue;

                    // 5. ユーザー詳細取得（名前用）
                    let fullName = member.email;

                    try {
                        const userRes = await directory.users.get({
                            userKey: member.email,
                        });

                        fullName =
                            userRes.data.name?.fullName ??
                            userRes.data.primaryEmail ??
                            member.email;
                    } catch (e) {
                        // ユーザー取得に失敗しても同期は続行
                        console.warn(`ユーザー情報取得失敗: ${member.email}`);
                    }

                    // 6. DB に upsert
                    await prisma.groupMember.upsert({
                        where: {
                            groupId_email: {
                                groupId: group.id,
                                email: member.email,
                            },
                        },
                        update: {
                            role: member.role ?? "MEMBER",
                            fullName,
                        },
                        create: {
                            groupId: group.id,
                            email: member.email,
                            role: member.role ?? "MEMBER",
                            fullName,
                        },
                    });

                    totalMembers++;
                }

                pageToken = res.data.nextPageToken ?? undefined;
            } while (pageToken);
        }

        console.log(
            `同期完了：GroupMember 合計 ${totalMembers} 件を同期しました`
        );
    } catch (error) {
        console.error("GroupMember 同期中にエラーが発生しました:", error);
        throw error;
    }
}
