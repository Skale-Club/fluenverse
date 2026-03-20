"use client";

import { useEffect, useState } from "react";
import { fetchUsersFromSupabase } from "@/lib/supabase-server";
import { AdminSidebar } from "@/components/admin-sidebar";
import { UserAddModal } from "@/components/user-add-modal";

type User = {
    name: string;
    email: string;
    role: string;
    status: "Ativo" | "Desativado";
};

type UserRow = Record<string, unknown>;

function parseUser(row: UserRow): User {
    const nameValue = row.name ?? row.full_name ?? row.nome;
    const emailValue = row.email ?? row.user_email;
    const roleValue = row.role ?? row.perfil ?? row.cargo;
    const isActiveValue = row.is_active ?? row.active ?? row.enabled ?? true;

    return {
        name: typeof nameValue === "string" ? nameValue.trim() : "Sem nome",
        email: typeof emailValue === "string" ? emailValue.trim() : "Sem e-mail",
        role: typeof roleValue === "string" ? roleValue : "Usuário",
        status: isActiveValue ? "Ativo" : "Desativado",
    };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState("");
    const [username, setUsername] = useState("Admin");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch users using the existing server function but called via an API wrapper or client-side fetch if exposed
            // Since fetchUsersFromSupabase is local/server-side, we can use a client-side fetch to a new API list route if needed,
            // but for now, we'll implement a simple client-side load.
            const res = await fetch("/api/admin/users/list");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao buscar usuários.");
            setUsers(Array.isArray(data) ? data.map(parseUser) : []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Get username from cookie
        const match = document.cookie.match(/fluenverse_admin_user=([^;]+)/);
        if (match) setUsername(decodeURIComponent(match[1]));

        loadData();
    }, []);

    return (
        <main className="admin-page">
            <AdminSidebar username={username} />

            <section className="admin-content">
                <header className="admin-content-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <div>
                        <p className="form-kicker">Admin Usuários</p>
                        <h1>Gestão de acesso</h1>
                    </div>
                    <button className="primary-button" onClick={() => setIsModalOpen(true)}>
                        + Adicionar Usuário
                    </button>
                </header>

                <p className="admin-lead">Visualize e gerencie todos os usuários que possuem acesso ao sistema.</p>
                {error ? <p className="admin-lead" style={{ color: "red" }}>{error}</p> : null}

                <article className="admin-widget">
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>E-mail</th>
                                    <th>Perfil</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>Carregando...</td></tr>
                                ) : users.length > 0 ? (
                                    users.map((user, i) => (
                                        <tr key={i}>
                                            <td><strong>{user.name}</strong></td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                <span className={`status-badge ${user.status === "Ativo" ? "status-success" : "status-error"}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                                            Nenhum usuário encontrado no Supabase.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </article>
            </section>

            <UserAddModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadData}
            />
        </main>
    );
}
