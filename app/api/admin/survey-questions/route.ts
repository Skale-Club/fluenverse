
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function isAdmin() {
    const auth = cookies().get("fluenverse_admin_auth")?.value;
    const role = cookies().get("fluenverse_user_role")?.value?.toLowerCase();
    return auth === "1" && role === "admin";
}

const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

async function supabaseFetch(path: string, options: RequestInit = {}) {
    const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            ...options.headers,
        }
    });
    return response;
}

export async function GET() {
    if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const response = await supabaseFetch("survey_questions?select=*&order=order_index.asc");
        if (!response.ok) {
            const details = await response.text();
            return NextResponse.json({ error: details }, { status: response.status });
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const questions = Array.isArray(body) ? body : [body];

        // Format dates and ensure structure
        const rows = questions.map(q => ({
            ...q,
            updated_at: new Date().toISOString()
        }));

        const response = await supabaseFetch("survey_questions?on_conflict=key", {
            method: "POST",
            headers: {
                "Prefer": "resolution=merge-duplicates,return=representation"
            },
            body: JSON.stringify(rows)
        });

        if (!response.ok) {
            const details = await response.text();
            return NextResponse.json({ error: details }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const response = await supabaseFetch(`survey_questions?id=eq.${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const details = await response.text();
            return NextResponse.json({ error: details }, { status: response.status });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
