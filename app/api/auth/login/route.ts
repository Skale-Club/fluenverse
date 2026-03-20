import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password";

type DbUser = {
    name: string;
    role: string;
    email: string;
    username?: string;
    password_hash?: string;
    is_active?: boolean;
};

function isAdminEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    return normalized === "ellen@skale.club" || normalized === "skale.club@gmail.com";
}

function parseFallbackEmails() {
    return (process.env.ADMIN_FALLBACK_EMAILS || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
}

function isAdminRole(value: unknown) {
    const normalized = String(value || "").trim().toLowerCase();
    return ["admin", "administrador", "administrator", "superadmin", "owner"].includes(normalized);
}

function resolveRole(user: Pick<DbUser, "role" | "email">) {
    if (isAdminRole(user.role) || isAdminEmail(String(user.email || ""))) {
        return "Admin";
    }
    return "Usuário";
}

function buildFallbackUser(email: string): DbUser {
    const localName = email.split("@")[0] || "Admin";
    const normalizedName = localName
        .split(/[._-]/g)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

    return {
        name: normalizedName || "Admin",
        // Fallback list is an emergency admin allowlist.
        role: "Admin",
        email,
    };
}

export async function POST(request: Request) {
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
    const hasValidAnon = anonKey.length > 0 && anonKey !== "SUA_ANON_KEY_AQUI";
    const apiKey = serviceRoleKey || (hasValidAnon ? anonKey : "");

    try {
        const { email, identifier, password, authProvider } = await request.json();
        const normalizedIdentifier = String(identifier || email || "").trim().toLowerCase();
        const normalizedPassword = String(password || "").trim();
        const isGoogleAuth = authProvider === "google";
        const fallbackEmails = parseFallbackEmails();

        if (!normalizedIdentifier) {
            return NextResponse.json({ error: "Informe e-mail ou usuário." }, { status: 400 });
        }

        if (!isGoogleAuth && !normalizedPassword) {
            return NextResponse.json({ error: "Informe sua senha." }, { status: 400 });
        }

        if (!supabaseUrl || !apiKey) {
            if (fallbackEmails.includes(normalizedIdentifier)) {
                return NextResponse.json(buildFallbackUser(normalizedIdentifier));
            }

            return NextResponse.json(
                {
                    error:
                        "Configuração do Supabase ausente. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no deploy (ou ADMIN_FALLBACK_EMAILS para acesso emergencial).",
                },
                { status: 503 }
            );
        }

        const restUrl = new URL(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/users`);
        restUrl.searchParams.set("select", "name,role,email,username,password_hash,is_active");
        restUrl.searchParams.set(
            "or",
            `(email.eq.${normalizedIdentifier},username.eq.${normalizedIdentifier})`
        );
        restUrl.searchParams.set("limit", "1");

        const response = await fetch(restUrl, {
            method: "GET",
            headers: {
                apikey: apiKey,
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            if (fallbackEmails.includes(normalizedIdentifier)) {
                return NextResponse.json(buildFallbackUser(normalizedIdentifier));
            }

            const errorText = await response.text();
            if (errorText.includes("username") || errorText.includes("password_hash")) {
                return NextResponse.json(
                    {
                        error:
                            "A tabela users precisa das colunas `username` e `password_hash`. Rode o SQL de migração no Supabase e tente novamente.",
                    },
                    { status: 500 }
                );
            }

            if (response.status === 401 || response.status === 403) {
                return NextResponse.json(
                    { error: "Credenciais do Supabase inválidas (SUPABASE_SERVICE_ROLE_KEY)." },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { error: `Erro ao buscar usuário no banco (${response.status}): ${errorText}` },
                { status: 500 }
            );
        }

        const data = await response.json();
        const user = data[0];

        if (!user) {
            if (fallbackEmails.includes(normalizedIdentifier)) {
                return NextResponse.json(buildFallbackUser(normalizedIdentifier));
            }

            return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
        }

        if (user.is_active === false) {
            return NextResponse.json({ error: "Usuário desativado." }, { status: 403 });
        }

        if (!isGoogleAuth) {
            const passwordHash = String(user.password_hash || "");
            if (!passwordHash) {
                return NextResponse.json(
                    { error: "Usuário sem senha cadastrada. Atualize a senha no painel de admin." },
                    { status: 403 }
                );
            }

            const ok = verifyPassword(normalizedPassword, passwordHash);
            if (!ok) {
                return NextResponse.json({ error: "Senha inválida." }, { status: 401 });
            }
        }

        return NextResponse.json({
            name: user.name,
            role: resolveRole(user),
            email: user.email,
            username: user.username
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
