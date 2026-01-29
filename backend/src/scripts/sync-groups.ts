import "../config/google.js"; // env + auth 初期化
import { syncGroups } from "../services/syncGroups.js";

(async () => {
    try {
        await syncGroups();
        console.log("✅ sync-groups finished");
        process.exit(0);
    } catch (e) {
        console.error("❌ sync-groups failed", e);
        process.exit(1);
    }
})();
