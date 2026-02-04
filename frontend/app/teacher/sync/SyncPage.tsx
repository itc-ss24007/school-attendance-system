
"use client";
import { useState } from "react";
/**
 * データ同期
 * ・Google データ同期
 */

export default function SyncPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const handleSync = async () => {
        setLoading(true);
        setStatus("同期を開始しています…");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/directory`, {
                method: "POST",
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            setStatus("✅ 同期が完了しました");
        } catch {
            setStatus("❌ 同期に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="font-bold text-lg mb-4">データ更新</h2>

            <p className="text-sm text-gray-600 mb-4">
                Google ディレクトリとの同期を行います。
            </p>

            <button
                onClick={handleSync}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                {loading ? "同期中…" : "同期開始"}
            </button>

            {loading && (
                <div className="mt-3 text-sm text-gray-600">
                    ⏳ 処理中です。しばらくお待ちください。
                </div>
            )}

            {status && (
                <div className="mt-3 text-sm text-gray-800">{status}</div>
            )}

            <div className="text-gray-400 text-sm mt-4">
                ※ 管理者用機能<br />
                データ同期には約5〜10分程度かかります。<br />
                データ更新は主に新学期開始時、または更新が必要な場合に実行してください。
            </div>
        </div>
    );
}
