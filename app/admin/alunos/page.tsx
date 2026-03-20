import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchStudentsFromSupabase } from "@/lib/supabase-server";
import { AdminSidebar } from "@/components/admin-sidebar";

type Student = {
  name: string;
  level: string;
  status: "Ativo" | "Desativado";
};

type StudentRow = Record<string, unknown>;

function parseStudent(row: StudentRow): Student {
  const nameValue = row.name ?? row.full_name ?? row.student_name ?? row.nome;
  const levelValue = row.level ?? row.current_level ?? row.student_level ?? row.nivel;
  const statusValue = row.status ?? row.student_status ?? row.situacao;
  const isActiveValue = row.is_active ?? row.active ?? row.enabled;

  const statusFromBoolean = typeof isActiveValue === "boolean" ? (isActiveValue ? "Ativo" : "Desativado") : null;
  const statusFromText =
    typeof statusValue === "string" &&
      ["active", "ativo", "enabled", "on"].includes(statusValue.toLowerCase().trim())
      ? "Ativo"
      : "Desativado";

  return {
    name: typeof nameValue === "string" && nameValue.trim() ? nameValue.trim() : "Sem nome",
    level: typeof levelValue === "string" && levelValue.trim() ? levelValue.trim() : "Não informado",
    status: statusFromBoolean ?? statusFromText,
  };
}

async function loadStudentsFromSupabase() {
  const { data, error } = await fetchStudentsFromSupabase();
  if (error) {
    return {
      students: [] as Student[],
      error,
    };
  }

  const students = Array.isArray(data) ? (data as StudentRow[]).map(parseStudent) : [];
  return { students, error: "" };
}

export default async function AdminAlunosPage() {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get("fluenverse_admin_auth")?.value === "1";

  if (!isAuthenticated) {
    redirect("/login");
  }

  const { students } = await loadStudentsFromSupabase();
  const username = decodeURIComponent(cookieStore.get("fluenverse_admin_user")?.value ?? "Admin");
  const activeStudents = students.filter((student) => student.status === "Ativo");
  const inactiveStudents = students.filter((student) => student.status === "Desativado");

  return (
    <main className="admin-page">
      <AdminSidebar username={username} />

      <section className="admin-content">
        <header className="admin-content-header">
          <div>
            <p className="form-kicker">Admin Alunos</p>
            <h1>Gestão de alunos</h1>
          </div>
        </header>

        <p className="admin-lead">Acompanhe alunos ativos e desativados em um único painel.</p>

        <div className="students-summary">
          <article className="admin-widget">
            <h2>Total de alunos</h2>
            <p>{students.length}</p>
          </article>
          <article className="admin-widget">
            <h2>Alunos ativos</h2>
            <p>{activeStudents.length}</p>
          </article>
          <article className="admin-widget">
            <h2>Alunos desativados</h2>
            <p>{inactiveStudents.length}</p>
          </article>
        </div>

        <div className="students-columns">
          <article className="admin-widget">
            <h2>Ativos</h2>
            <ul className="students-list">
              {activeStudents.map((student) => (
                <li key={student.name}>
                  <span>{student.name}</span>
                  <span>{student.level}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="admin-widget">
            <h2>Desativados</h2>
            <ul className="students-list">
              {inactiveStudents.map((student) => (
                <li key={student.name}>
                  <span>{student.name}</span>
                  <span>{student.level}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
