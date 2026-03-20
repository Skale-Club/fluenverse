"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CHAT_LANGUAGE_OPTIONS,
  CHAT_MODEL_OPTIONS,
  DEFAULT_LANGUAGE,
  DEFAULT_MODEL,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_TRIGGER_LABEL,
  DEFAULT_WELCOME_MESSAGE,
  type ChatLanguage,
  type ChatModel
} from "@/lib/chat-config";

export function AdminChatSettings() {
  const [enabled, setEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_WELCOME_MESSAGE);
  const [triggerLabel, setTriggerLabel] = useState(DEFAULT_TRIGGER_LABEL);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [model, setModel] = useState<ChatModel>(DEFAULT_MODEL);
  const [language, setLanguage] = useState<ChatLanguage>(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch("/api/admin/chat-config", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Erro ao carregar configurações do chat.");
        }

        setEnabled(Boolean(payload.enabled));
        setWelcomeMessage(payload.welcomeMessage || DEFAULT_WELCOME_MESSAGE);
        setTriggerLabel(payload.triggerLabel || DEFAULT_TRIGGER_LABEL);
        setSystemPrompt(payload.systemPrompt || DEFAULT_SYSTEM_PROMPT);
        setModel((payload.model as ChatModel) || DEFAULT_MODEL);
        setLanguage((payload.language as ChatLanguage) || DEFAULT_LANGUAGE);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Falha ao carregar chat.");
      } finally {
        setReady(true);
      }
    }

    loadConfig();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFeedback("Salvando...");
    try {
      const response = await fetch("/api/admin/chat-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          welcomeMessage: welcomeMessage.trim() || DEFAULT_WELCOME_MESSAGE,
          triggerLabel: triggerLabel.trim() || DEFAULT_TRIGGER_LABEL,
          systemPrompt: systemPrompt.trim() || DEFAULT_SYSTEM_PROMPT,
          model,
          language
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Erro ao salvar configurações do chat.");
      }

      setFeedback("Configurações do chat salvas no banco.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Falha ao salvar chat.");
    }
  };

  return (
    <article className="admin-widget">
      <h2>Configurações do chat</h2>
      <p>Controle o comportamento do chat da página inicial.</p>
      <form className="chat-settings-form" onSubmit={handleSubmit}>
        <label className="field chat-settings-span">
          Chat ativo
          <select value={enabled ? "true" : "false"} onChange={(event) => setEnabled(event.target.value === "true")} disabled={!ready}>
            <option value="true">Ativo</option>
            <option value="false">Desativado</option>
          </select>
        </label>

        <label className="field chat-settings-span">
          Mensagem inicial
          <textarea rows={4} value={welcomeMessage} onChange={(event) => setWelcomeMessage(event.target.value)} disabled={!ready} />
        </label>

        <label className="field chat-settings-span">
          System prompt do agente
          <textarea rows={5} value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} disabled={!ready} />
        </label>

        <label className="field">
          Modelo padrao
          <select value={model} onChange={(event) => setModel(event.target.value as ChatModel)} disabled={!ready}>
            {CHAT_MODEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Idioma das respostas
          <select value={language} onChange={(event) => setLanguage(event.target.value as ChatLanguage)} disabled={!ready}>
            {CHAT_LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Texto do botão
          <input type="text" value={triggerLabel} onChange={(event) => setTriggerLabel(event.target.value)} disabled={!ready} />
        </label>

        <div className="integration-actions chat-settings-span">
          <button type="submit" className="primary-button" disabled={!ready}>
            Salvar configurações
          </button>
        </div>

        {feedback ? <p className="chat-settings-span">{feedback}</p> : null}
      </form>
    </article>
  );
}
