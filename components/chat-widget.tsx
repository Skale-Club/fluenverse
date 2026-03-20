"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_MODEL,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_TRIGGER_LABEL,
  DEFAULT_WELCOME_MESSAGE,
  type ChatLanguage,
  type ChatModel
} from "@/lib/chat-config";
import { PUBLIC_ASSETS } from "@/lib/public-assets";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function ChatWidget() {
  const [sessionId] = useState(
    () =>
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`)
  );
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_WELCOME_MESSAGE);
  const [triggerLabel, setTriggerLabel] = useState(DEFAULT_TRIGGER_LABEL);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [model, setModel] = useState<ChatModel>(DEFAULT_MODEL);
  const [language, setLanguage] = useState<ChatLanguage>(DEFAULT_LANGUAGE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch("/api/admin/chat-config", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) return;

        const nextWelcome = payload.welcomeMessage || DEFAULT_WELCOME_MESSAGE;

        setEnabled(Boolean(payload.enabled));
        setWelcomeMessage(nextWelcome);
        setTriggerLabel(payload.triggerLabel || DEFAULT_TRIGGER_LABEL);
        setSystemPrompt(payload.systemPrompt || DEFAULT_SYSTEM_PROMPT);
        setModel((payload.model as ChatModel) || DEFAULT_MODEL);
        setLanguage((payload.language as ChatLanguage) || DEFAULT_LANGUAGE);

        setMessages((current) => {
          if (current.length === 0) return [{ role: "assistant", content: nextWelcome }];
          const hasUserMessages = current.some((item) => item.role === "user");
          if (!hasUserMessages && current.length === 1 && current[0].role === "assistant") {
            return [{ role: "assistant", content: nextWelcome }];
          }
          return current;
        });
      } catch {
        // Keep defaults if chat config endpoint is unavailable.
      }
    }

    loadConfig();
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: welcomeMessage }]);
    }
  }, [messages.length, welcomeMessage]);

  useEffect(() => {
    const container = chatBodyRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, loading, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextUserMessage = message.trim();
    if (!nextUserMessage || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: nextUserMessage }];
    setMessages(nextMessages);
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          language,
          systemPrompt,
          messages: nextMessages,
          sessionId
        })
      });

      const data = await response.json();
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Falha ao gerar resposta.");
      }

      setMessages((current) => [...current, { role: "assistant", content: String(data.reply) }]);
    } catch (requestError) {
      const reason = requestError instanceof Error ? requestError.message : "Erro desconhecido.";
      setError(reason);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Nao consegui responder agora. Tente novamente em alguns segundos."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className="chat-widget">
      {open ? (
        <section className="chat-panel" aria-label="Chat Fluenverse">
          <header className="chat-header">
            <Link href="/" className="chat-header-brand">
              <img src={PUBLIC_ASSETS.logo} alt="Fluenverse" className="chat-header-logo" />
            </Link>
            <button
              type="button"
              className="chat-close"
              onClick={() => setOpen(false)}
              aria-label="Fechar chat"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              </svg>
            </button>
          </header>
          <div className="chat-body" aria-live="polite" ref={chatBodyRef}>
            {messages.map((item, index) => (
              <p key={`${item.role}-${index}`} className={`chat-message ${item.role === "user" ? "user" : "assistant"}`}>
                {item.content}
              </p>
            ))}
            {loading ? <p className="chat-message assistant">Digitando...</p> : null}
          </div>
          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Digite sua mensagem em portugues ou English..."
            />
            <button type="submit" disabled={loading}>
              {loading ? "..." : "Enviar"}
            </button>
          </form>
          {error ? <p className="chat-error">{error}</p> : null}
        </section>
      ) : (
        <div className="chat-preview-card">
          <div className="chat-preview-avatar">
            <img src={PUBLIC_ASSETS.leila} alt="Leila Vala" />
          </div>
          <p className="chat-preview-text">Comece por aqui!</p>
        </div>
      )}

      <button
        type="button"
        className={`chat-trigger-round ${open ? "open" : ""}`}
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Fechar chat" : "Abrir chat"}
      >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
          <circle cx="7" cy="10" r="1.5" />
          <circle cx="12" cy="10" r="1.5" />
          <circle cx="17" cy="10" r="1.5" />
        </svg>
      </button>
    </div>
  );
}
