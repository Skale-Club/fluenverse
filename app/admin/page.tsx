import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchUpcomingBookings } from "@/lib/ghl-server";
import { AdminSidebar } from "@/components/admin-sidebar";
import { fetchStudentsFromSupabase } from "@/lib/supabase-server";
import { readLeads, LeadRecord } from "@/lib/leads-store";

export default async function AdminPage() {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get("fluenverse_admin_auth")?.value === "1";
  const userRole = (cookieStore.get("fluenverse_user_role")?.value || "").toLowerCase();

  if (!isAuthenticated) {
    redirect("/login");
  }

  if (userRole !== "admin") {
    redirect("/");
  }

  const username = decodeURIComponent(cookieStore.get("fluenverse_admin_user")?.value ?? "Admin");
  const [bookingResult, studentsResult, leads] = await Promise.all([
    fetchUpcomingBookings(5),
    fetchStudentsFromSupabase(),
    readLeads()
  ]);

  const students = Array.isArray(studentsResult.data) ? studentsResult.data : [];
  const activeStudents = students.filter((student) => {
    if (typeof student !== "object" || student === null) return false;
    const row = student as Record<string, unknown>;
    return row.is_active !== false;
  });

  return (
    <main className="admin-page">
      <AdminSidebar username={username} />

      <section className="admin-content">
        <header className="admin-content-header">
          <div>
            <p className="form-kicker">Painel Fluenverse</p>
            <h1>Olá, {username}</h1>
          </div>
        </header>

        <p className="admin-lead">Você entrou com sucesso no painel administrativo.</p>

        <div className="admin-grid">
          <article className="admin-widget">
            <h2>Próximas sessões</h2>
            {bookingResult.error ? (
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Integração GHL pendente ou com erro.</p>
            ) : (
              <p>{bookingResult.bookings.length} sessão(ões) futuras no calendário Go High Level.</p>
            )}
            <Link href="/admin/bookings" className="header-link">
              Ver bookings
            </Link>
          </article>

          <article className="admin-widget">
            <h2>Leads gerados</h2>
            <p>{leads.length} leads capturados no site.</p>
            <Link href="/admin/leads" className="header-link">
              Ver todos os leads
            </Link>
          </article>

          <article className="admin-widget">
            <h2>Alunos ativos</h2>
            {studentsResult.error ? (
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Configuração Supabase pendente.</p>
            ) : (
              <p>{activeStudents.length} aluno(s) ativo(s) no banco.</p>
            )}
            <Link href="/admin/alunos" className="header-link">
              Ver alunos
            </Link>
          </article>

        </div>

        <div className="admin-grid-full" style={{ marginTop: "2rem" }}>
          <article className="admin-widget">
            <h2 style={{ marginBottom: "1.5rem" }}>Últimos leads recebidos</h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Data</th>
                    <th>Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                        Nenhum lead encontrado ainda.
                      </td>
                    </tr>
                  ) : (
                    leads.slice(0, 5).map((lead: LeadRecord) => (
                      <tr key={lead.id}>
                        <td style={{ fontWeight: 600 }}>{lead.name || "Sem nome"}</td>
                        <td>{lead.email || "Sem email"}</td>
                        <td>{new Date(lead.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                        <td>
                          <span className="status-badge status-success" style={{ opacity: 0.8 }}>
                            {lead.source === "chat" ? "Chat AI" : "Survey"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
