"use client";

import { useState } from "react";

type UserRole = "Admin" | "Usuário";

type UserAddModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function UserAddModal({ isOpen, onClose, onSuccess }: UserAddModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<UserRole>("Usuário");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const normalizedPassword = password.trim();
        if (normalizedPassword.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            setLoading(false);
            return;
        }

        if (normalizedPassword !== confirmPassword.trim()) {
            setError("As senhas não coincidem.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    username,
                    password: normalizedPassword,
                    role,
                    is_active: true
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erro ao salvar usuário.");
            }

            setName("");
            setEmail("");
            setUsername("");
            setPassword("");
            setConfirmPassword("");
            setRole("Usuário");
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="survey-overlay" onClick={onClose}>
            <div className="survey-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
                <header className="chat-header">
                    <div className="chat-header-brand">
                        <span style={{ fontWeight: 700, color: "var(--brand-purple)" }}>Novo Usuário</span>
                    </div>
                    <button type="button" className="chat-close" onClick={onClose}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                        </svg>
                    </button>
                </header>

                <div className="survey-content">
                    <form className="integrations-form" onSubmit={handleSubmit}>
                        <label className="field">
                            Nome Completo
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: João Silva"
                                required
                            />
                        </label>

                        <label className="field">
                            E-mail
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@exemplo.com"
                                required
                            />
                        </label>

                        <label className="field">
                            Usuário
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="ex: ellen"
                            />
                        </label>

                        <label className="field">
                            Senha
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                        </label>

                        <label className="field">
                            Confirmar senha
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repita a senha"
                                required
                            />
                        </label>

                        <label className="field">
                            Papel (Role)
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid #e5e8f3", width: "100%" }}
                            >
                                <option value="Usuário">Usuário</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </label>

                        {error && <p className="chat-error" style={{ gridColumn: "span 2" }}>{error}</p>}

                        <div className="integration-actions" style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                            <button className="primary-button" type="submit" disabled={loading}>
                                {loading ? "Salvando..." : "Criar Usuário"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
