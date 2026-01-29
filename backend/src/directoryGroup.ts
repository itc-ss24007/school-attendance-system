/**
 * Google Directory API を使用して
 * ログインユーザーが「学生か教職員か」を判定する処理
 */
import { google } from "googleapis";
import fs from "fs";

async function getGroup() {
    // Service Account の認証情報を読み込み
    const credentials = JSON.parse(
        fs.readFileSync("./service-account.json", "utf-8")
    );
    const hoge = new google.auth.GoogleAuth({
        credentials,
        scopes: [
            "https://www.googleapis.com/auth/admin.directory.group.readonly",
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
        const res = await directory.groups.list({
            customer: "my_customer",
        });

        return res.data;

    } catch (error) {
        console.error("Directory API エラー:", error);
        throw error;
    }
}

/* ===== テスト実行 ===== */
(async () => {
    //const loginUserEmail = "s24007@std.it-college.ac.jp"; // ← 自分の学生メール

    const role = await getGroup();
    console.log("判定結果:", role);
})();
