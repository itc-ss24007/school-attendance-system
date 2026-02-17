"use client";

import { useEffect,useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type StudentInfo = {
    studentNo: string;
    name: string;
    major: {
        majorName: string;
        grade: number;
        displayName: string;
    };
};
type AbsenceReport = {
    id: string;
    date: string;
    type: "absence" | "late" | "early_leave";
    reason?: string;
    createdAt: string;
};
const today = new Date().toLocaleDateString("sv-SE");
export default function StudentPage() {
    const { user, loading } = useAuth("student");

    const [date, setDate] = useState(today);
    const [type, setType] = useState("欠席");
    const [reason, setReason] = useState("");
    const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

    const [history, setHistory] = useState<AbsenceReport[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchStudentInfo = async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/students/me`,
                {
                    credentials: "include",
                }
            );

            if (!res.ok) {
                console.error("学生情報取得失敗");
                return;
            }

            const data = await res.json();
            setStudentInfo(data);
        };

        fetchStudentInfo();
    }, [user]);


    if (loading) {
        return <div className="p-10 text-center">読み込み中…</div>;
    }

    // 念のため
    if (!user) {
        return null;
    }
    const handleSubmit = async () => {
        if (!date) {
            alert("日付を選択してください");
            return;
        }

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/students/absenceReport`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        date,
                        type,   // ← 日本語のままでOK（backendで変換してる）
                        reason,
                    }),
                }
            );

            if (!res.ok) {
                const err = await res.json();
                alert(err.message || "送信に失敗しました");
                return;
            }

            alert("欠席連絡を送信しました");

            // フォーム初期化
            setDate("");
            setType("欠席");
            setReason("");

            // 履歴表示中なら再取得
            if (showHistory) {
                fetchHistory();
            }
        } catch (e) {
            alert("通信エラーが発生しました");
        }
    };
    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/students/absenceReport`,
                {
                    credentials: "include",
                }
            );

            if (!res.ok) {
                throw new Error();
            }

            const data = await res.json();
            setHistory(data);
            setShowHistory(true);
        } catch {
            alert("履歴の取得に失敗しました");
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
            {
                method: "POST",
                credentials: "include",
            }
        );
        window.location.href = "/login";
    };

    return (
        <main className="min-h-screen bg-gray-100 flex justify-center py-10">
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg">

                {/* ヘッダー */}
                <header className="flex justify-between items-center px-6 py-4 border-b">
                    <h1 className="text-xl font-bold">出席管理システム（学生）</h1>

                    <div className="flex items-center gap-4">

                        <button
                            onClick={handleLogout}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            ログアウト
                        </button>
                    </div>
                </header>

                {/* 学生情報 */}
                <section className="px-6 py-6 border-b">
                    {studentInfo ? (
                        <>
                            <p className="mb-1">学生：{studentInfo.name}</p>
                            <p className="mb-1">学科：{studentInfo.major.majorName}</p>
                            <p>学年：{studentInfo.major.grade}年生</p>
                        </>
                    ) : (
                        <p>学生情報を読み込み中...</p>
                    )}
                </section>

                {/* 連絡フォーム */}
                <section className="px-6 py-6">
                    <h2 className="font-bold mb-4">【欠席・遅刻・早退連絡】</h2>

                    {/* 日付 */}
                    <div className="mb-4">
                        <label className="block text-sm mb-1">日付</label>
                        <input
                            type="date"
                            value={date}
                            min={today}
                            onChange={(e) => setDate(e.target.value)}
                            className="border rounded px-3 py-2 w-60"
                        />
                    </div>

                    {/* タイプ */}
                    <div className="mb-4">
                        <label className="block text-sm mb-1">タイプ</label>
                        <div className="flex gap-6 text-sm">
                            {["欠席", "遅刻", "早退"].map((t) => (
                                <label key={t} className="flex items-center gap-1">
                                    <input
                                        type="radio"
                                        name="type"
                                        value={t}
                                        checked={type === t}
                                        onChange={() => setType(t)}
                                    />
                                    {t}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 理由 */}
                    <div className="mb-6">
                        <label className="block text-sm mb-1">理由</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="border rounded px-3 py-2 w-full"
                            placeholder="就職活動 など"
                        />
                    </div>

                    {/* 操作 */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleSubmit}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                        >
                            送信する
                        </button>

                        <button
                            onClick={fetchHistory}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            過去の連絡履歴を見る
                        </button>
                    </div>
                </section>
                {/* ===== 過去の連絡履歴 ===== */}
                {showHistory && (
                    <section className="px-6 py-6 border-t mt-6">
                        <h3 className="font-bold mb-4">過去の連絡履歴</h3>

                        {historyLoading && (
                            <p className="text-sm">読み込み中...</p>
                        )}

                        {!historyLoading && history.length === 0 && (
                            <p className="text-sm text-gray-500">
                                連絡履歴はありません
                            </p>
                        )}

                        {!historyLoading && history.length > 0 && (
                            <table className="w-full text-sm border">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-2 py-1">日付</th>
                                    <th className="border px-2 py-1">種別</th>
                                    <th className="border px-2 py-1">理由</th>
                                    <th className="border px-2 py-1">送信日時</th>
                                </tr>
                                </thead>
                                <tbody>
                                {history.map((h) => (
                                    <tr key={h.id}>
                                        <td className="border px-2 py-1">
                                            {new Date(h.date).toLocaleDateString()}
                                        </td>
                                        <td className="border px-2 py-1">
                                            {h.type === "absence"
                                                ? "欠席"
                                                : h.type === "late"
                                                    ? "遅刻"
                                                    : "早退"}
                                        </td>
                                        <td className="border px-2 py-1">
                                            {h.reason || "-"}
                                        </td>
                                        <td className="border px-2 py-1">
                                            {new Date(h.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}
