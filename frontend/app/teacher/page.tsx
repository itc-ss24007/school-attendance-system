"use client";

import { useState } from "react";
import AttendanceTop from "./attendance/AttendanceTop";

/**
 * 教師トップページ
 * ・クラス管理
 * ・出席管理
 * ・データ同期
 */
export default function TeacherTopPage() {
    // 表示中のタブ
    const [activeTab, setActiveTab] = useState<
        "major" | "attendance" | "sync"
    >("major");

    // 仮の教師情報（後で API から取得）
    const teacher = {
        name: "佐藤 太郎",
    };

    /**
     * ログアウト処理
     */
    const handleLogout = async () => {
        await fetch("http://localhost:5000/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        window.location.href = "/login";
    };

    return (
        <main className="min-h-screen bg-gray-100 flex justify-center py-10">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg">

                {/* ヘッダー */}
                <header className="flex justify-between items-center px-6 py-4 border-b">
                    <h1 className="text-lg font-bold">
                        出席管理システム（教師）
                    </h1>

                    <div className="flex items-center gap-4">
                        <span className="text-sm">
                            教師：{teacher.name}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            ログアウト
                        </button>
                    </div>
                </header>

                {/* 下部ナビゲーション（タブ） */}
                <nav className="flex border-b">
                    <TabButton
                        label="クラス管理"
                        active={activeTab === "major"}
                        onClick={() => setActiveTab("major")}
                    />
                    <TabButton
                        label="出席管理"
                        active={activeTab === "attendance"}
                        onClick={() => setActiveTab("attendance")}
                    />
                    <TabButton
                        label="データ同期"
                        active={activeTab === "sync"}
                        onClick={() => setActiveTab("sync")}
                    />
                </nav>

                {/* コンテンツエリア */}
                <section className="px-6 py-6">
                    {activeTab === "major" && <MajorManage />}
                    {activeTab === "attendance" && <AttendanceTop />}
                    {activeTab === "sync" && <SyncPage />}
                </section>
            </div>
        </main>
    );
}

/**
 * タブ用ボタン
 */
function TabButton({
                       label,
                       active,
                       onClick,
                   }: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition
                ${
                active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-blue-600"
            }`}
        >
            {label}
        </button>
    );
}

/* ===============================
   以下は各機能の仮コンポーネント
   =============================== */

/**
 * クラス管理（仮）
 * ・在学中クラス一覧
 * ・卒業済み設定
 */
function MajorManage() {
    return (
        <div>
            <h2 className="font-bold text-lg mb-4">
                班级管理
            </h2>

            <p className="text-sm text-gray-600 mb-4">
                在学中のクラスを管理し、卒業済みに設定できます。
            </p>

            {/* 今後ここに班级一覧を表示 */}
            <div className="text-gray-400 text-sm">
                ※ 現在は未実装
            </div>
        </div>
    );
}

/**
 * データ同期（仮）
 * ・Google データ同期
 */
function SyncPage() {
    return (
        <div>
            <h2 className="font-bold text-lg mb-4">
                数据更新
            </h2>

            <p className="text-sm text-gray-600 mb-4">
                Google データとの同期を行います。
            </p>

            {/* 今後ここに同期ボタン */}
            <div className="text-gray-400 text-sm">
                ※ 管理者用機能（未実装）
            </div>
        </div>
    );
}
