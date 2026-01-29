"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth";


export function useAuth(requiredRole?: "student" | "teacher") {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const run = async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
                { credentials: "include" }
            );

            if (!res.ok) {
                router.replace("/login");
                return;
            }

            const { loggedIn, user } = await res.json();

            if (!loggedIn || !user) {
                router.replace("/login");
                return;
            }

            if (requiredRole && user.role !== requiredRole) {
                router.replace("/"); // 交给入口页重新分流
                return;
            }

            setUser(user);
            setLoading(false);
        };

        run();
    }, [requiredRole, router]);

    return { user, loading };
}
