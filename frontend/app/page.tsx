"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/app/me`,
                    //'http://localhost:5000/auth/me',
                    {
                        credentials: "include", // ★ 重要
                    }
                );

                // 未登录
                if (res.status === 401) {
                    router.replace("/login");
                    return;
                }

                const data = await res.json();

                if (data.user.role === "student") {
                    router.replace("/student");
                } else if (data.user.role === "teacher") {
                    router.replace("/teacher");
                } else {
                    router.replace("/login");
                }
            } catch (e) {
                console.error(e);
                router.replace("/login");
            }
        };

        checkLogin();
    }, [router]);

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            ログイン状態を確認しています…
        </div>
    );
}
