"use client";

import { useEffect, useState } from "react";

/**
 * 型定義
 */
type Major = {
    id: string;
    displayName: string;
};

type AttendanceRecord = {
    studentNo: string;
    studentName: string; // 后端 include 后返回的姓名
    period1: string;
    period2: string;
    period3: string;
    period4: string;
};

// 后端 Enum 到 日文显示 的映射 (适配你的 Prisma Enum)
const STATUS_MAP: Record<string, { label: string; color: string }> = {
    present: { label: "出席", color: "text-green-600" },
    late: { label: "遅刻", color: "text-orange-500 font-bold" },
    early_leave: { label: "早退", color: "text-purple-500 font-bold" },
    absence: { label: "欠席", color: "text-red-600 font-bold" },
};

// 状态点击切换的顺序
const STATUS_ORDER = ["present", "late", "early_leave", "absence"];

export default function AttendanceTop() {
    const [majors, setMajors] = useState<Major[]>([]);
    const [majorId, setMajorId] = useState("");
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [hasAttendance, setHasAttendance] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // 保存按钮状态

    const getTodayString = () => new Date().toISOString().slice(0, 10);
    const todayLabel = new Date().toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    // クラス一覧取得
    useEffect(() => {
        const fetchMajors = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/major`, {
                    credentials: "include",
                });
                const data = await res.json();
                setMajors(data.majors || []);
            } catch (err) {
                console.error("クラス一覧取得エラー:", err);
            }
        };
        fetchMajors();
    }, []);

    // 出席簿取得 (GET /attendance/today)
    const fetchTodayAttendance = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/today?majorId=${id}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            if (data.records && data.records.length > 0) {
                setRecords(data.records);
                setHasAttendance(true);
            } else {
                setRecords([]);
                setHasAttendance(false);
            }
        } catch (err) {
            console.error("出席簿取得エラー:", err);
            setHasAttendance(false);
        } finally {
            setLoading(false);
        }
    };

    // 出席簿新規作成 (POST /attendance/create)
    const handleCreateAttendance = async () => {
        if (!majorId) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ majorId, date: getTodayString() }),
            });
            if (res.status === 409 || res.ok) {
                if (res.ok) alert("出席簿を作成しました。");
                await fetchTodayAttendance(majorId);
            }
        } catch (err) {
            console.error("出席簿作成エラー:", err);
        }
    };

    // ★ 状态切换逻辑 (前台修改)
    const toggleStatus = (studentNo: string, period: keyof AttendanceRecord) => {
        setRecords(prev => prev.map(r => {
            if (r.studentNo === studentNo) {
                const currentStatus = r[period];
                const currentIndex = STATUS_ORDER.indexOf(currentStatus);
                const nextStatus = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];
                return { ...r, [period]: nextStatus };
            }
            return r;
        }));
    };

    // ★ 批量保存逻辑 (PUT /attendance/update)
    const handleUpdateAttendance = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ majorId, records }),
            });
            if (res.ok) {
                alert("出席簿を保存しました。");
            } else {
                alert("保存に失敗しました。");
            }
        } catch (err) {
            console.error("保存エラー:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* クラス選択 */}
            <div className="mb-8 bg-white p-4 rounded shadow-sm border">
                <label className="block text-sm font-semibold mb-2 text-gray-600">クラスを選択してください</label>
                <select
                    value={majorId}
                    onChange={(e) => {
                        const id = e.target.value;
                        setMajorId(id);
                        setRecords([]);
                        if (id) fetchTodayAttendance(id);
                    }}
                    className="border border-gray-300 rounded px-4 py-2 w-full max-w-[520px] bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">▼ クラスを選択</option>
                    {majors.map((major) => (
                        <option key={major.id} value={major.id}>{major.displayName}</option>
                    ))}
                </select>
            </div>

            {majorId && (
                <div className="border-t pt-6">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-sm text-gray-500">実施日：{todayLabel}</p>
                            <h3 className="text-lg font-bold text-gray-700">出席名簿</h3>
                        </div>
                        {hasAttendance && (
                            <button
                                onClick={handleUpdateAttendance}
                                disabled={isSaving}
                                className="bg-green-600 text-white px-8 py-2 rounded shadow hover:bg-green-700 disabled:bg-gray-400 font-bold transition-all"
                            >
                                {isSaving ? "保存中..." : "変更を保存"}
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
                    ) : !hasAttendance ? (
                        <div className="bg-blue-50 border border-blue-200 p-8 rounded-lg text-center">
                            <p className="text-blue-800 mb-4 font-medium">本日の出席簿がまだ作成されていません。</p>
                            <button onClick={handleCreateAttendance} className="bg-blue-600 text-white px-10 py-3 rounded shadow hover:bg-blue-700 font-bold transition-all">本日の出席簿を新規作成</button>
                        </div>
                    ) : (
                        <div className="overflow-hidden border rounded-lg shadow-sm bg-white">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 border-b text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold w-32 text-sm">学籍番号</th>
                                    <th className="px-4 py-3 font-semibold text-sm">氏名</th>
                                    {["1限", "2限", "3限", "4限"].map((h) => (
                                        <th key={h} className="px-4 py-3 font-semibold text-center w-24 text-sm">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y text-gray-600">
                                {records.map((r) => (
                                    <tr key={r.studentNo} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs">{r.studentNo}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{r.studentName}</td>
                                        {[1, 2, 3, 4].map((i) => {
                                            const field = `period${i}` as keyof AttendanceRecord;
                                            const status = r[field];
                                            return (
                                                <td
                                                    key={i}
                                                    onClick={() => toggleStatus(r.studentNo, field)}
                                                    className={`px-4 py-3 text-center cursor-pointer select-none border-x text-sm transition-all hover:bg-gray-100 ${STATUS_MAP[status]?.color}`}
                                                >
                                                    {STATUS_MAP[status]?.label || "-"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <div className="bg-gray-50 p-3 text-[10px] text-gray-400 border-t">
                                ※ 枠内をクリックすると状態が切り替わります：出席 → 遅刻 → 早退 → 欠席
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}