import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AdminBookingsPage() {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get("fluenverse_admin_auth")?.value === "1";

  if (!isAuthenticated) {
    redirect("/login");
  }

  const username = decodeURIComponent(cookieStore.get("fluenverse_admin_user")?.value ?? "Admin");

  return (
    <main className="admin-page">
      <AdminSidebar username={username} />

      <section className="admin-content">
        <header className="admin-content-header">
          <div>
            <p className="form-kicker">Admin Bookings</p>
            <h1>Próximas sessões (Go High Level)</h1>
          </div>
        </header>

        <article className="admin-widget">
          <p>
            Esta página está em manutenção temporária no deploy atual.
          </p>
          <p>
            Use o dashboard principal para acompanhar os dados enquanto finalizamos a sincronização de bookings.
          </p>
        </article>
      </section>
    </main>
  );
}

