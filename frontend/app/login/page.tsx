"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function loginPage() {


    const handleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div
                className="
                    bg-white
                    p-10
                    rounded-xl
                    shadow-lg
                    w-[520px]
                    min-h-[440px]
                    text-center
                    flex
                    flex-col
                    justify-center
                "
            >
                <h1 className="text-2xl font-bold">
                    専門学校 ITカレッジ沖縄
                </h1>
                <h2 className="text-lg mt-2 text-gray-600">
                    出席管理システム
                </h2>

                <p className="mt-8 text-sm leading-relaxed text-gray-700">
                    本校の Google アカウントで<br />
                    ログインしてください
                </p>

                <button
                    onClick={handleLogin}
                    className="
                        mt-8
                        w-full
                        bg-blue-600
                        text-white
                        py-3
                        rounded-lg
                        font-medium
                        cursor-pointer
                        hover:bg-blue-700
                        active:scale-95
                        transition
                        duration-200
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-400
                    "
                >
                    Googleでログイン
                </button>

                <p className="mt-6 text-xs text-gray-500">
                    ※ 学生・教職員のみ利用可能
                </p>
            </div>
        </main>
    );
}
