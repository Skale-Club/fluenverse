import { NextResponse } from "next/server";
import { CHAT_MODEL_OPTIONS, DEFAULT_MODEL, type ChatLanguage, type ChatModel } from "@/lib/chat-config";
import { upsertChatLead } from "@/lib/leads-store";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
  model?: string;
  systemPrompt?: string;
  language?: ChatLanguage;
  sessionId?: string;
};

const ALLOWED_MODELS = new Set<string>(CHAT_MODEL_OPTIONS.map((item) => item.value));

function buildLanguageInstruction(language: ChatLanguage | undefined) {
  if (language === "pt") {
    return "Respond in Portuguese (pt-BR).";
  }
  if (language === "en") {
    return "Respond in English.";
  }
  return "Reply in the same language used by the user (Portuguese or English).";
}

function sanitizeMessages(messages: ChatMessage[] | undefined) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((message) => message && (message.role === "user" || message.role === "assistant"))
    .map((message) => ({
      role: message.role,
      content: String(message.content || "").trim()
    }))
    .filter((message) => message.content.length > 0)
    .slice(-12);
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY nao configurada no ambiente." }, { status: 500 });
  }

  const body = (await request.json()) as ChatRequestBody;
  const model = ALLOWED_MODELS.has(body.model || "") ? (body.model as ChatModel) : DEFAULT_MODEL;
  const languageInstruction = buildLanguageInstruction(body.language);
  const systemPrompt = String(body.systemPrompt || "").trim();
  const history = sanitizeMessages(body.messages);
  const sessionId = String(body.sessionId || "").trim();

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `${systemPrompt || "You are a helpful conversational assistant for Fluenverse."} ${languageInstruction}`
    },
    ...history
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Falha ao gerar resposta (${response.status}): ${errorText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply || typeof reply !== "string") {
      return NextResponse.json({ error: "Resposta vazia da IA." }, { status: 502 });
    }

    try {
      const transcriptHistory = history
        .filter((item): item is ChatMessage & { role: "user" | "assistant" } => item.role !== "system")
        .map((item) => ({ role: item.role, content: item.content }));

      await upsertChatLead({
        sessionId,
        model,
        locale: body.language,
        transcript: [
          ...transcriptHistory,
          { role: "assistant", content: reply }
        ]
      });
    } catch (storageError) {
      console.error("Erro ao salvar lead de chat:", storageError);
    }

    return NextResponse.json({ reply, model });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: `Erro ao chamar provedor de IA: ${message}` }, { status: 500 });
  }
}
