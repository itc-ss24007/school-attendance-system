/**
 * Google Directory API を使用して
 * ログインユーザーが「学生か教職員か」を判定する処理
 */
import { google } from "googleapis";
import fs from "fs";

async function getOrgUnit() {
    // Service Account の認証情報を読み込み
    const credentials = JSON.parse(
        fs.readFileSync("./service-account.json", "utf-8")
    );
    const hoge = new google.auth.GoogleAuth({
        credentials,
        scopes: [
            "https://www.googleapis.com/auth/admin.directory.orgunit.readonly",
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
        const res = await directory.orgunits.list({
            customerId: "my_customer",
            type: "ALL",
        });
        const orgUnitPaths = (res.data.organizationUnits ?? []).map(unit => ({
            name: unit.name,
            orgUnitPath: unit.orgUnitPath,
            parentOrgUnitPath: unit.parentOrgUnitPath,
        }));

        orgUnitPaths.sort((a, b) =>
            (a.name ?? "").localeCompare(b.name ?? "", "ja")
        );

        //return orgUnitPaths;
        return res.data;

    } catch (error) {
        console.error("Directory API エラー:", error);
        throw error;
    }
}

/* ===== テスト実行 ===== */
(async () => {
    //const loginUserEmail = "s24007@std.it-college.ac.jp"; // ← 自分の学生メール

    const role = await getOrgUnit();
    console.log("判定結果:", role);
})();
