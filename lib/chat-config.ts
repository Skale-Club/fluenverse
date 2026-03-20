export const CHAT_FLAG_KEY = "fluenverse_chat_enabled";
export const CHAT_WELCOME_KEY = "fluenverse_chat_welcome_message";
export const CHAT_TRIGGER_KEY = "fluenverse_chat_trigger_label";
export const CHAT_SYSTEM_PROMPT_KEY = "fluenverse_chat_system_prompt";
export const CHAT_MODEL_KEY = "fluenverse_chat_model";
export const CHAT_LANGUAGE_KEY = "fluenverse_chat_language";

export const DEFAULT_WELCOME_MESSAGE = "Oi. Como podemos ajudar voce a evoluir no ingles hoje?";
export const DEFAULT_TRIGGER_LABEL = "Abrir chat";
export const DEFAULT_SYSTEM_PROMPT =
  "You are Fluenverse's conversational agent. Be concise, friendly, and practical. Help users with English conversation practice, pronunciation tips, grammar corrections, and confidence-building feedback.";
export const DEFAULT_MODEL = "gpt-4o-mini";
export const DEFAULT_LANGUAGE = "auto";

export const CHAT_MODEL_OPTIONS = [
  { value: "gpt-4o-mini", label: "GPT-4o mini" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 mini" },
  { value: "gpt-4.1", label: "GPT-4.1" }
] as const;

export const CHAT_LANGUAGE_OPTIONS = [
  { value: "auto", label: "Auto (mesmo idioma do usuario)" },
  { value: "pt", label: "Portugues" },
  { value: "en", label: "English" }
] as const;

export type ChatModel = (typeof CHAT_MODEL_OPTIONS)[number]["value"];
export type ChatLanguage = (typeof CHAT_LANGUAGE_OPTIONS)[number]["value"];

