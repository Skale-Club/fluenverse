
"use client";

import { useEffect, useState } from "react";

type QuestionType = "text" | "email" | "tel" | "textarea" | "checkbox-group" | "radio";

type SurveyQuestion = {
    id: string;
    key: string;
    type: QuestionType;
    label_pt: string;
    label_en: string;
    placeholder_pt?: string;
    placeholder_en?: string;
    options_pt?: string[];
    options_en?: string[];
    required: boolean;
    order_index: number;
};

export function AdminSurveyManager() {
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<SurveyQuestion> | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchQuestions();
    }, []);

    async function fetchQuestions() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/survey-questions");
            if (!res.ok) throw new Error("Failed to fetch questions");
            const data = await res.json();
            setQuestions(data);
        } catch (err) {
            setError("Erro ao carregar perguntas.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveQuestion() {
        if (!editing) return;
        if (!editing.key || !editing.label_pt || !editing.label_en) {
            setError("Preencha os campos obrigatórios (Chave, Labels).");
            return;
        }

        setSaving(true);
        setError("");
        try {
            const res = await fetch("/api/admin/survey-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...editing,
                    order_index: editing.id ? editing.order_index : questions.length + 1
                })
            });

            if (!res.ok) throw new Error("Failed to save");
            await fetchQuestions();
            setEditing(null);
        } catch (err) {
            setError("Erro ao salvar pergunta.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir esta pergunta?")) return;

        try {
            const res = await fetch(`/api/admin/survey-questions?id=${id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete");
            setQuestions(prev => prev.filter(q => q.id !== id));
        } catch (err) {
            setError("Erro ao excluir pergunta.");
        }
    }

    async function handleMove(index: number, direction: "up" | "down") {
        const newQuestions = [...questions];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

        // Swap
        const temp = newQuestions[index];
        newQuestions[index] = newQuestions[targetIndex];
        newQuestions[targetIndex] = temp;

        // Update order_index
        const updated = newQuestions.map((q, i) => ({ ...q, order_index: i + 1 }));
        setQuestions(updated);

        // Save to DB
        try {
            await fetch("/api/admin/survey-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated)
            });
        } catch (err) {
            setError("Erro ao salvar nova ordem.");
        }
    }

    if (loading) return <div className="admin-loading">Carregando perguntas...</div>;

    return (
        <div className="survey-manager">
            <header className="manager-header">
                <h2>Gerenciar Perguntas do Survey</h2>
                <button className="primary-button add-btn" onClick={() => setEditing({ type: "text", required: false, options_pt: [], options_en: [] })}>
                    + Nova Pergunta
                </button>
            </header>

            {error && <p className="admin-error-banner">{error}</p>}

            <div className="questions-list">
                {questions.map((q, index) => (
                    <div key={q.id} className="question-card">
                        <div className="q-order-actions">
                            <button disabled={index === 0} onClick={() => handleMove(index, "up")} title="Mover para cima">▲</button>
                            <button disabled={index === questions.length - 1} onClick={() => handleMove(index, "down")} title="Mover para baixo">▼</button>
                        </div>
                        <div className="q-info">
                            <span className="q-badge">{q.type}</span>
                            <h3 className="q-title">{q.label_pt}</h3>
                            <p className="q-subtitle">{q.key} • {q.required ? "Obrigatória" : "Opcional"}</p>
                        </div>
                        <div className="q-actions">
                            <button className="secondary-button" onClick={() => setEditing(q)}>Editar</button>
                            <button className="delete-btn" onClick={() => handleDelete(q.id)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {editing && (
                <div className="admin-modal-overlay" onClick={() => setEditing(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <header>
                            <h3>{editing.id ? "Editar Pergunta" : "Nova Pergunta"}</h3>
                            <button className="close-x" onClick={() => setEditing(null)}>&times;</button>
                        </header>
                        <div className="modal-body">
                            <div className="field-group">
                                <label>Chave do Campo (ex: email, objective) *</label>
                                <input 
                                    type="text" 
                                    value={editing.key || ""} 
                                    onChange={e => setEditing({...editing, key: e.target.value})} 
                                    placeholder="campo_db"
                                />
                            </div>

                            <div className="field-row">
                                <div className="field-group">
                                    <label>Tipo de Pergunta</label>
                                    <select value={editing.type} onChange={e => setEditing({...editing, type: e.target.value as QuestionType})}>
                                        <option value="text">Texto Curto</option>
                                        <option value="textarea">Texto Longo</option>
                                        <option value="email">E-mail</option>
                                        <option value="tel">Telefone</option>
                                        <option value="radio">Escolha Única (Radio)</option>
                                        <option value="checkbox-group">Múltipla Escolha (Checkbox)</option>
                                    </select>
                                </div>
                                <div className="field-group checkbox-inline">
                                    <label>
                                        <input type="checkbox" checked={editing.required} onChange={e => setEditing({...editing, required: e.target.checked})} />
                                        Obrigatória?
                                    </label>
                                </div>
                            </div>

                            <div className="field-row">
                                <div className="field-group">
                                    <label>Label (PT) *</label>
                                    <input type="text" value={editing.label_pt || ""} onChange={e => setEditing({...editing, label_pt: e.target.value})} />
                                </div>
                                <div className="field-group">
                                    <label>Label (EN) *</label>
                                    <input type="text" value={editing.label_en || ""} onChange={e => setEditing({...editing, label_en: e.target.value})} />
                                </div>
                            </div>

                            {["text", "textarea", "email", "tel"].includes(editing.type || "") && (
                                <div className="field-row">
                                    <div className="field-group">
                                        <label>Placeholder (PT)</label>
                                        <input type="text" value={editing.placeholder_pt || ""} onChange={e => setEditing({...editing, placeholder_pt: e.target.value})} />
                                    </div>
                                    <div className="field-group">
                                        <label>Placeholder (EN)</label>
                                        <input type="text" value={editing.placeholder_en || ""} onChange={e => setEditing({...editing, placeholder_en: e.target.value})} />
                                    </div>
                                </div>
                            )}

                            {["radio", "checkbox-group"].includes(editing.type || "") && (
                                <div className="options-editor">
                                    <label>Opções (Uma por linha)</label>
                                    <div className="field-row">
                                        <div className="field-group">
                                            <span>Opções PT</span>
                                            <textarea 
                                                rows={4} 
                                                value={editing.options_pt?.join("\n") || ""} 
                                                onChange={e => setEditing({...editing, options_pt: e.target.value.split("\n").filter(Boolean)})}
                                            />
                                        </div>
                                        <div className="field-group">
                                            <span>Opções EN</span>
                                            <textarea 
                                                rows={4} 
                                                value={editing.options_en?.join("\n") || ""} 
                                                onChange={e => setEditing({...editing, options_en: e.target.value.split("\n").filter(Boolean)})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <footer>
                            <button className="secondary-button" onClick={() => setEditing(null)}>Cancelar</button>
                            <button className="primary-button" onClick={handleSaveQuestion} disabled={saving}>
                                {saving ? "Salvando..." : "Salvar"}
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            <style jsx>{`
                .survey-manager {
                    padding: 1rem;
                }
                .manager-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .questions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .question-card {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1.2rem;
                    background: white;
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                    transition: transform 0.2s ease;
                }
                .question-card:hover {
                    transform: translateX(4px);
                    border-color: var(--agenda-purple);
                }
                .q-order-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }
                .q-order-actions button {
                    background: #f3f4f6;
                    border: none;
                    border-radius: 4px;
                    padding: 0.3rem 0.5rem;
                    cursor: pointer;
                    font-size: 0.7rem;
                    transition: all 0.2s;
                }
                .q-order-actions button:hover:not(:disabled) {
                    background: #e5e7eb;
                    color: var(--purple);
                }
                .q-info {
                    flex: 1;
                }
                .q-badge {
                    display: inline-block;
                    padding: 0.2rem 0.6rem;
                    background: #eef2ff;
                    color: #4f46e5;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-bottom: 0.4rem;
                    text-transform: uppercase;
                }
                .q-title {
                    margin: 0;
                    font-size: 1.1rem;
                    color: #111827;
                }
                .q-subtitle {
                    margin: 0.2rem 0 0;
                    font-size: 0.9rem;
                    color: #6b7280;
                }
                .q-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .delete-btn {
                    background: transparent;
                    border: none;
                    color: #ef4444;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: background 0.2s;
                }
                .delete-btn:hover {
                    background: #fee2e2;
                }
                .admin-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    display: grid;
                    place-items: center;
                    z-index: 1000;
                    padding: 1rem;
                }
                .admin-modal {
                    background: white;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 650px;
                    max-height: 90vh;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
                }
                .admin-modal header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #f3f4f6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .close-x {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #9ca3af;
                }
                .modal-body {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                }
                .field-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    align-items: end;
                }
                .field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .field-group label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #374151;
                }
                .field-group input, 
                .field-group select, 
                .field-group textarea {
                    padding: 0.7rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 1rem;
                }
                .checkbox-inline {
                    flex-direction: row;
                    align-items: center;
                    gap: 0.5rem;
                    padding-bottom: 0.8rem;
                }
                .options-editor {
                    border-top: 1px solid #f3f4f6;
                    padding-top: 1rem;
                }
                .options-editor label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                }
                .options-editor span {
                   font-size: 0.8rem;
                   color: #6b7280;
                   margin-bottom: 0.2rem;
                   display: block;
                }
                .admin-modal footer {
                    padding: 1.5rem;
                    border-top: 1px solid #f3f4f6;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }
                .admin-error-banner {
                    background: #fee2e2;
                    color: #b91c1c;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                }
            `}</style>
        </div>
    );
}
