import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readLeads } from "@/lib/leads-store";

function isAuthenticatedAdmin() {
  const auth = cookies().get("fluenverse_admin_auth")?.value;
  return auth === "1";
}

export async function GET() {
  if (!isAuthenticatedAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leads = await readLeads();
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Erro ao listar leads:", error);
    return NextResponse.json({ error: "Erro interno ao listar leads." }, { status: 500 });
  }
}

