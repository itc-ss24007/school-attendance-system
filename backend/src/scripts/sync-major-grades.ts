import { syncMajorGrades } from "../services/majorBuild.service.js";

async function main() {
    console.log("学科同期処理 開始");

    await syncMajorGrades();

    console.log("学科同期処理 完了");
}

main()
    .catch((e) => {
        console.error("同期処理エラー", e);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });
