"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// Inline SVG Components to avoid external dependencies
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const Trash2Icon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const CheckCircle2Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

const CircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
);

export function WorkspaceClient({ username }: { username: string }) {
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "1", text: "Definir conteúdo final da landing", completed: false },
    { id: "2", text: "Revisar CTA e links internos", completed: false },
    { id: "3", text: "Validar versão PT/EN", completed: false },
    { id: "4", text: "Planejar integração com backend", completed: false },
  ]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("workspace_notes");
    if (savedNotes) setNotes(savedNotes);

    const savedChecklist = localStorage.getItem("workspace_checklist");
    if (savedChecklist) {
      try {
        setChecklist(JSON.parse(savedChecklist));
      } catch (e) {
        console.error("Failed to parse checklist", e);
      }
    }

    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("workspace_notes", notes);
    localStorage.setItem("workspace_checklist", JSON.stringify(checklist));
  }, [notes, checklist, isLoaded]);

  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: "",
      completed: false,
    };
    setChecklist([...checklist, newItem]);
  };

  const updateChecklistItem = (id: string, text: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, text } : item));
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  return (
    <main className="admin-page">
      <AdminSidebar username={username} />

      <section className="admin-content">
        <header className="admin-content-header">
          <div>
            <p className="form-kicker">Workspace Admin</p>
            <h1>Área de trabalho de {username}</h1>
          </div>
        </header>

        <p className="admin-lead">
          Use esta página para organizar textos, blocos e decisões. Suas alterações são salvas automaticamente.
        </p>

        <div className="workspace-grid">
          <article className="admin-widget">
            <div className="widget-header-row">
              <h2>Checklist rápido</h2>
              <button 
                className="action-icon-button" 
                onClick={addChecklistItem}
                title="Adicionar item"
              >
                <PlusIcon />
              </button>
            </div>
            
            <div className="workspace-checklist-container">
              {checklist.length === 0 ? (
                <p className="empty-state">Nenhum item no checklist. Adicione um novo!</p>
              ) : (
                <ul className="workspace-interactive-list">
                  {checklist.map((item) => (
                    <li key={item.id} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                      <button 
                        className="check-button" 
                        onClick={() => toggleChecklistItem(item.id)}
                      >
                        {item.completed ? (
                          <span className="text-purple"><CheckCircle2Icon /></span>
                        ) : (
                          <CircleIcon />
                        )}
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                        placeholder="Tarefa..."
                        className="checklist-input"
                      />
                      <button 
                        className="remove-button" 
                        onClick={() => removeChecklistItem(item.id)}
                      >
                        <Trash2Icon />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          <article className="admin-widget">
            <h2>Notas de trabalho</h2>
            <textarea
              className="workspace-notes"
              placeholder="Escreva aqui os ajustes, textos e tarefas da próxima etapa..."
              rows={15}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </article>
        </div>
      </section>

      <style jsx global>{`
        .widget-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .action-icon-button {
          background: #f0f2f9;
          border: none;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #5b47d6;
          transition: all 0.2s ease;
        }
        
        .action-icon-button:hover {
          background: #e4e8f3;
          transform: scale(1.05);
        }

        .workspace-interactive-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          background: #f9fbff;
          border: 1px solid #dfe4f3;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .checklist-item:focus-within {
          border-color: #5b47d6;
          box-shadow: 0 0 0 2px rgba(91, 71, 214, 0.1);
        }

        .checklist-item.completed {
          opacity: 0.7;
          background: #f4f6fc;
        }

        .checklist-item.completed .checklist-input {
          text-decoration: line-through;
          color: #8c93ab;
        }

        .check-button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: #8c93ab;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .check-button:hover {
          color: #5b47d6;
        }

        .text-purple {
          color: #5b47d6;
        }

        .checklist-input {
          flex: 1;
          background: none;
          border: none;
          font-size: 0.95rem;
          color: #1f2433;
          padding: 0.25rem 0;
          outline: none;
        }

        .remove-button {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: #ff8fa3;
          opacity: 0;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checklist-item:hover .remove-button {
          opacity: 1;
        }

        .remove-button:hover {
          color: #ff4d6d;
          transform: scale(1.1);
        }

        .empty-state {
          text-align: center;
          color: #8c93ab;
          padding: 2rem 0;
          font-size: 0.9rem;
        }
      `}</style>
    </main>
  );
}
