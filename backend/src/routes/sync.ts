// routes/sync.ts
import { Router } from "express";
import { syncGroups } from "../services/syncGroups.js";
import { syncGroupMembers } from "../services/syncMembers.js";
import { requireTeacher } from "../middlewares/requireTeacher.js";
import {syncMajorGrades} from "@/services/majorBuild.service.js"
import {syncAllStudents} from "@/services/syncAllStudents.js";

const router = Router();

router.post("/directory", requireTeacher, async (req, res) => {
    try {
        // 第一步：group同期
        console.log("▶ Phase1: Groups");
        await syncGroups();

        // 第二步：member同期
        console.log("▶ Phase2: Group Members");
        await syncGroupMembers();

        console.log("▶ Phase3: Major Grades");
        await syncMajorGrades();

        console.log("▶ Phase4: Students");
        await syncAllStudents();

        res.json({
            success: true,
            message: "DirectoryAPIからデータ同期完成",
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "同期失败",
        });
    }
});

export default router;
