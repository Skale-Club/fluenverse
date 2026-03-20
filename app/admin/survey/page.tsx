
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminSurveyManager } from "@/components/admin-survey-manager";

export default function AdminSurveyPage() {
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

    return (
        <main className="admin-page">
            <AdminSidebar username={username} />

            <section className="admin-content">
                <header className="admin-content-header">
                    <div>
                        <p className="form-kicker">Customização do Site</p>
                        <h1>Perguntas do Survey</h1>
                    </div>
                </header>

                <div className="admin-card-wide">
                    <AdminSurveyManager />
                </div>
            </section>
        </main>
    );
}
