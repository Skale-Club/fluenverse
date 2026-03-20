import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminChatSettings } from "@/components/admin-chat-settings";

export default function AdminChatConfigPage() {
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
            <p className="form-kicker">Admin Chat</p>
            <h1>Configurações do chat</h1>
          </div>
        </header>

        <p className="admin-lead">Defina estado, mensagem inicial, system prompt, modelo e idioma do chat do site.</p>
        <AdminChatSettings />
      </section>
    </main>
  );
}
