"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasSupabasePublicConfig, supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        async function handleAuth() {
            if (!hasSupabasePublicConfig || !supabase) {
                router.push("/login?error=Google login indisponível");
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            const email = session.user.email;
            if (!email) {
                router.push("/login?error=Email not found");
                return;
            }

            try {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, authProvider: "google" }),
                });

                const data = await res.json();

                if (res.ok && data.role === "Admin") {
                    const maxAge = 60 * 60 * 24 * 30; // 30 days
                    document.cookie = `fluenverse_admin_auth=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
                    document.cookie = `fluenverse_admin_user=${encodeURIComponent(data.name)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
                    document.cookie = `fluenverse_user_role=${encodeURIComponent(data.role)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
                    document.cookie = `fluenverse_user_initials=${encodeURIComponent(data.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2))}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;

                    router.push("/admin/chat-config");
                } else {
                    // User page (Home for now)
                    router.push("/");
                }
            } catch (err) {
                console.error("Auth error:", err);
                router.push("/");
            }
        }

        handleAuth();
    }, [router]);

    return (
        <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
            <p>Redirecionando...</p>
        </div>
    );
}
