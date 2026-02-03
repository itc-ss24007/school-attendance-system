import { useEffect, useState } from "react";

type Major = {
    id: string;
    majorName: string;
    grade: string;
    enrollYear: number;
    flag: boolean; // true: 卒業済み
};
/**
 * クラス管理（仮）
 * ・在学中クラス一覧
 * ・卒業済み設定
 */
export default function MajorManage() {
    const [majors, setMajors] = useState<Major[]>([]);
    const [loading, setLoading] = useState(true);

    /**
     * クラス一覧取得（卒業済み含む）
     */
    const fetchMajors = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/major?includeGraduated=true`,
                { credentials: "include" }
            );
            const data = await res.json();
            setMajors(data.majors ?? []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * 卒業フラグ更新
     */
    const updateGraduated = async (id: string, graduated: boolean) => {
        const ok = confirm(
            graduated
                ? "このクラスを卒業済みに設定しますか？"
                : "在学中に戻しますか？"
        );
        if (!ok) return;

        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/major/${id}/graduated`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ graduated }),
                }
            );

            // 更新後に再取得（出席管理と整合性を保つ）
            fetchMajors();
        } catch (err) {
            console.error(err);
            alert("更新に失敗しました");
        }
    };

    useEffect(() => {
        fetchMajors();
    }, []);

    const activeMajors = majors.filter(m => !m.flag);
    const graduatedMajors = majors.filter(m => m.flag);

    if (loading) {
        return <p className="text-sm text-gray-500">読み込み中...</p>;
    }

    return (
        <div>
            <h2 className="font-bold text-lg mb-6">
                クラス管理
            </h2>

            {/* 在学中 */}
            <section className="mb-8">
                <h3 className="font-semibold mb-3">
                    在学中のクラス
                </h3>

                {activeMajors.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        在学中のクラスはありません
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {activeMajors.map(m => (
                            <li
                                key={m.id}
                                className="flex justify-between items-center border rounded-lg px-4 py-3"
                            >
                                <div>
                                    <p className="font-medium">
                                        {m.majorName} {m.grade}年
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        入学年度：{m.enrollYear}
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        updateGraduated(m.id, true)
                                    }
                                    className="text-sm text-red-600 hover:underline"
                                >
                                    卒業済みにする
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* 卒業済み */}
            <section>
                <h3 className="font-semibold mb-3">
                    卒業済みクラス
                </h3>

                {graduatedMajors.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        卒業済みクラスはありません
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {graduatedMajors.map(m => (
                            <li
                                key={m.id}
                                className="flex justify-between items-center bg-gray-50 border rounded-lg px-4 py-2"
                            >
                                <span className="text-sm text-gray-600">
                                    {m.majorName} {m.grade}年
                                    （{m.enrollYear}）
                                </span>

                                <button
                                    onClick={() =>
                                        updateGraduated(m.id, false)
                                    }
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    在学中に戻す
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
