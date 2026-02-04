/**
 * Google Directory API を使用して
 * ログインユーザーが「学生か教職員か」を判定する処理
 */
import { google } from "googleapis";
import fs from "fs";

async function getGroupMembers() {
    // Service Account の認証情報を読み込み
    const credentials = JSON.parse(
        fs.readFileSync("./service-account.json", "utf-8")
    );
    const hoge = new google.auth.GoogleAuth({
        credentials,
        scopes: [
            "https://www.googleapis.com/auth/admin.directory.group.member.readonly",
        ],
        clientOptions:{
            subject: 's06019@std.it-college.ac.jp'
        }
    })
    // Directory API クライアント生成
    const directory = google.admin({
        version: "directory_v1",
        auth: hoge,
    });

    try {
        const res = await directory.members.list({
            // groupKey: '03j2qqm346deifl',
            // groupKey: '01y810tw0kucdbc',
            groupKey: '00kgcv8k1hve6c6',
        });

        /**
         * members が null の可能性があるため ?? []
         */
        return (res.data.members ?? []).map(m => ({
            email: m.email ?? "",
            role: m.role ?? "",
            type: m.type ?? "",
        }));

    } catch (error) {
        console.error("Directory API エラー:", error);
        throw error;
    }
}

/* ===== テスト実行 ===== */
(async () => {
    //const loginUserEmail = "s24007@std.it-college.ac.jp"; // ← 自分の学生メール

    const role = await getGroupMembers();
    console.log("判定結果:", role);
})();
