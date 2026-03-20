import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { removeLeadById } from "@/lib/leads-store";

function isAuthenticatedAdmin() {
  const auth = cookies().get("fluenverse_admin_auth")?.value;
  return auth === "1";
}

type RouteContext = {
  params: {
    id: string;
  };
};

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isAuthenticatedAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leadId = decodeURIComponent(context.params.id || "").trim();
  if (!leadId) {
    return NextResponse.json({ error: "Lead id inválido." }, { status: 400 });
  }

  try {
    const result = await removeLeadById(leadId);
    if (!result.ok) {
      return NextResponse.json({ error: "Falha ao excluir lead." }, { status: 500 });
    }

    if (!result.removed) {
      return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir lead:", error);
    return NextResponse.json({ error: "Erro interno ao excluir lead." }, { status: 500 });
  }
}

