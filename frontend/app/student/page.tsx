"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function StudentPage() {
    const { user, loading } = useAuth("student");

    const [date, setDate] = useState("");
    const [type, setType] = useState("欠席");
    const [reason, setReason] = useState("");

    if (loading) {
        return <div className="p-10 text-center">読み込み中…</div>;
    }

    // 念のため
    if (!user) {
        return null;
    }
    console.log("user object:", user);
    const handleSubmit = () => {
        console.log({
            date,
            type,
            reason,
        });
        alert("送信しました（※ 仮実装）");
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
                    <h1 className="text-lg font-bold">出席管理システム</h1>

                    <div className="flex items-center gap-4">
                        <span className="text-sm">学生：{user.name}</span>
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
                    {/* 🚧 这里后面可以从 user.groups 推导 */}
                    <p className="text-sm mb-2">学科：ITスペシャリスト科</p>
                    <p className="text-sm">学年：2年生</p>

                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                        ※ 所属 Group 情報から判定<br />
                        ※ データ内に「科」または「コース」を含む名称を使用（正規表現）
                    </p>
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

                        <button className="text-blue-600 hover:underline text-sm">
                            過去の連絡履歴を見る
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}
