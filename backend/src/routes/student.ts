import { Router } from "express";
import { requireStudent } from "../middlewares/requireStudent.js";
import { prisma } from "@/lib/prisma.js";

const router = Router();

router.get("/me", requireStudent, async (req, res) => {
    const user = req.user as any;

    const student = await prisma.student.findUnique({
        where: { studentNo: user.studentNo },
        include: { major: true },
    });

    if (!student) {
        return res.status(404).json({ message: "学生情報が見つかりません" });
    }

    res.json({
        studentNo: student.studentNo,
        name: student.name,
        major: {
            majorName: student.major.majorName,
            grade: student.major.grade,
            displayName: student.major.displayName,
        },
    });
});

export default router;
