"use client";

import { useEffect, useState } from "react";

export function AdminChatControl() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/chat-config", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (response.ok) {
          setEnabled(Boolean(payload.enabled));
        }
      } finally {
        setReady(true);
      }
    }

    load();
  }, []);

  const toggleChat = async () => {
    if (!ready) return;
    const next = !enabled;

    const response = await fetch("/api/admin/chat-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next })
    });

    if (!response.ok) return;

    setEnabled(next);
  };

  return (
    <article className="admin-widget">
      <h2>Chat pop-up</h2>
      <p>
        Status atual: <strong>{ready ? (enabled ? "Ativado" : "Desativado") : "Carregando..."}</strong>
      </p>
      <button type="button" className="secondary-button admin-toggle" onClick={toggleChat} disabled={!ready}>
        {enabled ? "Desativar chat" : "Ativar chat"}
      </button>
    </article>
  );
}

