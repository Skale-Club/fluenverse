"use client";

import { useEffect, useMemo, useState } from "react";
import type { LeadRecord } from "@/lib/leads-store";

type LeadsManagerProps = {
  initialLeads: LeadRecord[];
};

type FilterType = "all" | "chat" | "survey";
type SurveyStatusFilter = "all" | "completed" | "incomplete";

export function AdminLeadsManager({ initialLeads }: LeadsManagerProps) {
  const [leads, setLeads] = useState<LeadRecord[]>(initialLeads);
  const [filter, setFilter] = useState<FilterType>("all");
  const [surveyStatusFilter, setSurveyStatusFilter] = useState<SurveyStatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLeads() {
      try {
        const response = await fetch("/api/admin/leads", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json().catch(() => [])) as LeadRecord[];
        if (!active || !Array.isArray(data)) return;
        setLeads(data);
      } catch {
        // Keep current list on transient failures.
      }
    }

    void loadLeads();
    const interval = setInterval(() => {
      void loadLeads();
    }, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  function getSurveyCompletion(lead: LeadRecord) {
    if (lead.source !== "survey") return null;
    return lead.completed === true;
  }

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Filter by type
      if (filter !== "all" && lead.source !== filter) return false;

      if (lead.source === "survey" && surveyStatusFilter !== "all") {
        const isCompleted = getSurveyCompletion(lead) === true;
        if (surveyStatusFilter === "completed" && !isCompleted) return false;
        if (surveyStatusFilter === "incomplete" && isCompleted) return false;
      }

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const searchableText = [
          lead.name,
          lead.email,
          lead.phone,
          lead.location,
          lead.sessionId,
          ...(lead.transcript?.map((t) => t.content) || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(term)) return false;
      }

      return true;
    });
  }, [leads, filter, searchTerm, surveyStatusFilter]);

  const selectedLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Data inválida";
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getLeadName(lead: LeadRecord) {
    if (lead.source === "survey") return lead.name || "Lead sem nome";
    return lead.name || `Guest (${lead.sessionId?.slice(0, 8)})`;
  }

  function getLeadSnippet(lead: LeadRecord) {
    if (lead.source === "survey") {
      return `Objetivo: ${lead.objective?.join(", ") || "Não informado"}`;
    }
    const lastUserMsg = lead.transcript?.filter((m) => m.role === "user").pop();
    return lastUserMsg?.content || "Iniciou chat";
  }

  async function handleDeleteLead(lead: LeadRecord) {
    const name = getLeadName(lead);
    const confirmed = window.confirm(`Tem certeza que deseja excluir o lead "${name}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    try {
      setDeletingLeadId(lead.id);
      const response = await fetch(`/api/admin/leads/${encodeURIComponent(lead.id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        window.alert(payload.error || "Não foi possível excluir o lead.");
        return;
      }

      setLeads((current) => current.filter((item) => item.id !== lead.id));
      if (selectedLeadId === lead.id) {
        setSelectedLeadId(null);
      }
    } finally {
      setDeletingLeadId(null);
    }
  }

  return (
    <div className="leads-manager-container">
      {/* Sidebar */}
      <aside className="leads-sidebar">
        <div className="leads-sidebar-header">
          <div className="leads-sidebar-header-top">
            <h2>Conversations</h2>
            <button className="theme-toggle-btn" style={{ border: "none", background: "transparent", color: "#6b7280" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>

          <div className="leads-search-container">
            <svg className="leads-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              className="leads-search-input"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="leads-filter-tabs">
            <button
              className={`leads-filter-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Todos
            </button>
            <button
              className={`leads-filter-tab ${filter === "chat" ? "active" : ""}`}
              onClick={() => setFilter("chat")}
            >
              Chat
            </button>
            <button
              className={`leads-filter-tab ${filter === "survey" ? "active" : ""}`}
              onClick={() => setFilter("survey")}
            >
              Survey
            </button>
          </div>
          <div className="leads-filter-tabs" style={{ marginTop: "0.5rem" }}>
            <button
              className={`leads-filter-tab ${surveyStatusFilter === "all" ? "active" : ""}`}
              onClick={() => setSurveyStatusFilter("all")}
            >
              Todos status
            </button>
            <button
              className={`leads-filter-tab ${surveyStatusFilter === "completed" ? "active" : ""}`}
              onClick={() => setSurveyStatusFilter("completed")}
            >
              Completos
            </button>
            <button
              className={`leads-filter-tab ${surveyStatusFilter === "incomplete" ? "active" : ""}`}
              onClick={() => setSurveyStatusFilter("incomplete")}
            >
              Incompletos
            </button>
          </div>
        </div>

        <div className="leads-scroll-area">
          {filteredLeads.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af", fontSize: "0.9rem" }}>
              Nenhum lead encontrado.
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className={`lead-list-item ${selectedLeadId === lead.id ? "active" : ""}`}
                onClick={() => setSelectedLeadId(lead.id)}
              >
                <div className="lead-item-header">
                  <span className="lead-item-name">{getLeadName(lead)}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span className="lead-item-date">{formatDate(lead.createdAt)}</span>
                    <button
                      type="button"
                      title="Excluir lead"
                      aria-label="Excluir lead"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleDeleteLead(lead);
                      }}
                      disabled={deletingLeadId === lead.id}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#ef4444",
                        cursor: deletingLeadId === lead.id ? "not-allowed" : "pointer",
                        padding: 0,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="lead-item-snippet">{getLeadSnippet(lead)}</div>
                <div className="lead-item-source">{lead.source}</div>
                {lead.source === "survey" ? (
                  <div className={`status-pill ${getSurveyCompletion(lead) ? "enabled" : "paused"}`}>
                    {getSurveyCompletion(lead) ? "Completo" : "Incompleto"}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="leads-main-content">
        {selectedLead ? (
          <>
            <div className="lead-detail-header">
              <div className="lead-detail-info">
                <h3>{getLeadName(selectedLead)}</h3>
                <p>Lead via {selectedLead.source} • {formatDate(selectedLead.createdAt)}</p>
                {selectedLead.source === "survey" ? (
                  <div className={`status-pill ${getSurveyCompletion(selectedLead) ? "enabled" : "paused"}`} style={{ marginTop: "0.35rem", width: "fit-content" }}>
                    {getSurveyCompletion(selectedLead) ? "Survey completo" : "Survey incompleto"}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="secondary-button danger"
                onClick={() => void handleDeleteLead(selectedLead)}
                disabled={deletingLeadId === selectedLead.id}
                style={{ marginLeft: "auto" }}
              >
                {deletingLeadId === selectedLead.id ? "Excluindo..." : "Excluir lead"}
              </button>
            </div>

            <div className="lead-detail-body">
              <section className="detail-section">
                <h4>Informações de Contato</h4>
                <div className="detail-grid">
                  <div className="detail-field">
                    <label>Nome</label>
                    <span>{selectedLead.name || "-"}</span>
                  </div>
                  <div className="detail-field">
                    <label>E-mail</label>
                    <span>{selectedLead.email || "-"}</span>
                  </div>
                  <div className="detail-field">
                    <label>Telefone</label>
                    <span>{selectedLead.phone || "-"}</span>
                  </div>
                  <div className="detail-field">
                    <label>Localização</label>
                    <span>{selectedLead.location || "-"}</span>
                  </div>
                  {selectedLead.sessionId && (
                    <div className="detail-field">
                      <label>Session ID</label>
                      <span style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>{selectedLead.sessionId}</span>
                    </div>
                  )}
                </div>
              </section>

              {selectedLead.source === "survey" && (
                <section className="detail-section">
                  <h4>Respostas do Survey</h4>
                  <div className="detail-grid">
                    <div className="detail-field">
                      <label>Objetivo</label>
                      <span>{selectedLead.objective?.join(", ") || "-"}</span>
                    </div>
                    {selectedLead.objectiveOther && (
                      <div className="detail-field">
                        <label>Objetivo (outro)</label>
                        <span>{selectedLead.objectiveOther}</span>
                      </div>
                    )}
                    <div className="detail-field">
                      <label>Nível</label>
                      <span>{selectedLead.level || "-"}</span>
                    </div>
                    <div className="detail-field">
                      <label>Dificuldade</label>
                      <span>{selectedLead.difficulty || "-"}</span>
                    </div>
                    <div className="detail-field">
                      <label>Melhores dias</label>
                      <span>{selectedLead.bestDay?.join(", ") || "-"}</span>
                    </div>
                  </div>
                </section>
              )}

              {selectedLead.source === "chat" && (
                <section className="detail-section">
                  <h4>Transcrição do Chat</h4>
                  <div className="detail-transcript">
                    {selectedLead.transcript && selectedLead.transcript.length > 0 ? (
                      selectedLead.transcript.map((msg, idx) => (
                        <div key={idx} className={`transcript-msg ${msg.role}`}>
                          <span className="msg-role">{msg.role === "user" ? "Lead" : "Assistant"}</span>
                          {msg.content}
                        </div>
                      ))
                    ) : (
                      <p>Nenhuma mensagem registrada.</p>
                    )}
                  </div>
                </section>
              )}
            </div>
          </>
        ) : (
          <div className="leads-empty-state">
            <svg className="leads-empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div>
              <h3>No lead selected</h3>
              <p>Select a lead from the list to view details.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
