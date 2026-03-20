import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminIntegrationsNew } from "@/components/admin-integrations-new";

export default function AdminIntegracoesPage() {
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
        <AdminIntegrationsNew />
      </section>
    </main>
  );
}
