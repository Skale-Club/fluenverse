import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { readLeads } from "@/lib/leads-store";
import { AdminLeadsManager } from "@/components/admin-leads-manager";

export default async function AdminLeadsPage() {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get("fluenverse_admin_auth")?.value === "1";

  if (!isAuthenticated) {
    redirect("/login");
  }

  const username = decodeURIComponent(cookieStore.get("fluenverse_admin_user")?.value ?? "Admin");
  const leads = await readLeads();

  return (
    <main className="admin-page">
      <AdminSidebar username={username} />

      <section className="admin-content" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <header className="admin-content-header" style={{ marginBottom: "1rem" }}>
          <div>
            <p className="form-kicker">Admin Leads</p>
            <h1>Leads recebidos</h1>
          </div>
        </header>

        <AdminLeadsManager initialLeads={leads} />
      </section>
    </main>
  );
}
