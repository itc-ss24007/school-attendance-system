/**
 * Google Directory API を使用して
 * ログインユーザーが「学生か教職員か」を判定する処理
 */
import { google } from "googleapis";
import fs from "fs";
/**
 * ユーザー種別判定
 * @param {string} userEmail ログイン後に取得したユーザーのメールアドレス
 */
async function checkUserRoletest(userEmail: string) {
    // Service Account の認証情報を読み込み
    const credentials = JSON.parse(
        fs.readFileSync("./service-account.json", "utf-8")
    );

    /**
     * JWT クライアント作成
     * subject には「管理者アカウントのメールアドレス」を指定
     * ※ Domain-Wide Delegation 必須
     */
    const hoge = new google.auth.GoogleAuth({
        credentials,
        scopes: [
            "https://www.googleapis.com/auth/admin.directory.user.readonly",
        ],
        clientOptions:{
            subject: 's06019@std.it-college.ac.jp'
        }
    })
    // const auth = new google.auth.JWT({
    //     email: credentials.client_email,
    //     key: credentials.private_key,
    //     scopes: [
    //         "https://www.googleapis.com/auth/admin.directory.user.readonly",
    //     ],
    //     subject: process.env.ADMIN_EMAIL, // ← 管理者のメール
    // });

    // Directory API クライアント生成
    const directory = google.admin({
        version: "directory_v1",
        auth: hoge,
    });

    try {
        /**
         * 指定したメールアドレスのユーザー情報を取得
         */
        const res = await directory.users.get({
            userKey: userEmail,
        });

        const user = res.data;

        /**
         * 判定ロジック例
         * - orgUnitPath
         * - customSchemas
         * - isAdmin
         */

        console.log("ユーザー情報取得成功");
       // console.log("氏名:", user.name.fullName);
        console.log("組織単位:", user.orgUnitPath);
        return user;
        // // 例① 組織単位で判定
        // if (user.orgUnitPath.startsWith("/Students")) {
        //     return "student";
        // }
        //
        // if (user.orgUnitPath.startsWith("/Teachers")) {
        //     return "teacher";
        // }
        //
        // return "unknown";

    } catch (error) {
        console.error("Directory API エラー:", error);
        throw error;
    }
}

/* ===== テスト実行 ===== */
(async () => {
    const loginUserEmail = "s24019@std.it-college.ac.jp"; // ← 自分の学生メール

    const role = await checkUserRoletest(loginUserEmail);
    console.log("判定結果:", role);
})();
