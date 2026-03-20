import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";

function isAdminEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    return normalized === "ellen@skale.club" || normalized === "skale.club@gmail.com";
}

export async function POST(request: Request) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: "Configuração do Supabase ausente." }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { name, email, username, password, is_active } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Nome, email e senha são obrigatórios." }, { status: 400 });
        }

        if (String(password).trim().length < 6) {
            return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedUsername = String(username || normalizedEmail.split("@")[0] || "")
            .trim()
            .toLowerCase();
        const passwordHash = hashPassword(String(password).trim());

        const effectiveRole = isAdminEmail(normalizedEmail) ? "Admin" : "Usuário";

        const restUrl = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/users?on_conflict=email`;

        const response = await fetch(restUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: serviceRoleKey,
                Authorization: `Bearer ${serviceRoleKey}`,
                Prefer: "resolution=merge-duplicates,return=representation",
            },
            body: JSON.stringify({
                name: String(name).trim(),
                email: normalizedEmail,
                username: normalizedUsername,
                password_hash: passwordHash,
                role: effectiveRole,
                is_active: is_active ?? true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (errorText.includes("password_hash") || errorText.includes("username")) {
                return NextResponse.json(
                    {
                        error:
                            "A tabela users precisa das colunas `username` e `password_hash` para login com senha criptografada.",
                    },
                    { status: 500 }
                );
            }
            return NextResponse.json({ error: `Supabase error: ${errorText}` }, { status: response.status });
        }

        const data = await response.json();
        const safeData = Array.isArray(data)
            ? data.map((row) => ({
                id: row.id,
                name: row.name,
                email: row.email,
                username: row.username,
                role: row.role,
                is_active: row.is_active,
            }))
            : data;

        return NextResponse.json(safeData);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
