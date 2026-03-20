import { NextResponse } from "next/server";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_MODEL,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_TRIGGER_LABEL,
  DEFAULT_WELCOME_MESSAGE
} from "@/lib/chat-config";
import { readIntegrationConfig, writeIntegrationConfig } from "@/lib/integration-config";

const CHAT_KEYS = {
  enabled: "CHAT_ENABLED",
  welcome: "CHAT_WELCOME_MESSAGE",
  trigger: "CHAT_TRIGGER_LABEL",
  prompt: "CHAT_SYSTEM_PROMPT",
  model: "CHAT_MODEL",
  language: "CHAT_LANGUAGE"
} as const;

export async function GET() {
  const { config } = await readIntegrationConfig();

  return NextResponse.json({
    enabled: config[CHAT_KEYS.enabled] === "true",
    welcomeMessage: config[CHAT_KEYS.welcome] || DEFAULT_WELCOME_MESSAGE,
    triggerLabel: config[CHAT_KEYS.trigger] || DEFAULT_TRIGGER_LABEL,
    systemPrompt: config[CHAT_KEYS.prompt] || DEFAULT_SYSTEM_PROMPT,
    model: config[CHAT_KEYS.model] || DEFAULT_MODEL,
    language: config[CHAT_KEYS.language] || DEFAULT_LANGUAGE
  });
}

export async function POST(request: Request) {
  try {
    const { config: current } = await readIntegrationConfig();
    const body = (await request.json().catch(() => ({}))) as {
      enabled?: boolean;
      welcomeMessage?: string;
      triggerLabel?: string;
      systemPrompt?: string;
      model?: string;
      language?: string;
    };

    const result = await writeIntegrationConfig({
      [CHAT_KEYS.enabled]:
        body.enabled === undefined ? String(current[CHAT_KEYS.enabled] || "false") : (body.enabled ? "true" : "false"),
      [CHAT_KEYS.welcome]: String(
        body.welcomeMessage ?? current[CHAT_KEYS.welcome] ?? DEFAULT_WELCOME_MESSAGE
      ),
      [CHAT_KEYS.trigger]: String(
        body.triggerLabel ?? current[CHAT_KEYS.trigger] ?? DEFAULT_TRIGGER_LABEL
      ),
      [CHAT_KEYS.prompt]: String(
        body.systemPrompt ?? current[CHAT_KEYS.prompt] ?? DEFAULT_SYSTEM_PROMPT
      ),
      [CHAT_KEYS.model]: String(body.model ?? current[CHAT_KEYS.model] ?? DEFAULT_MODEL),
      [CHAT_KEYS.language]: String(body.language ?? current[CHAT_KEYS.language] ?? DEFAULT_LANGUAGE)
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao salvar configurações do chat." }, { status: 500 });
  }
}
