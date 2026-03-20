import { NextResponse } from "next/server";
import { upsertContact } from "@/lib/ghl-server";
import { notifyAdmins } from "@/lib/twilio-server";
import { readIntegrationConfig } from "@/lib/integration-config";
import { sendFacebookConversionEvent } from "@/lib/facebook-server";
import { appendSurveyLead, upsertSurveyLead } from "@/lib/leads-store";

type SurveyBody = {
  name?: string;
  location?: string;
  email?: string;
  objective?: string[];
  objectiveOther?: string;
  level?: string;
  difficulty?: string[];
  bestDay?: string[];
  phone?: string;
  locale?: "pt" | "en";
};

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asList(value: unknown) {
  return Array.isArray(value) ? value.map((item) => asText(item)).filter(Boolean) : [];
}

import { sendTelegramNotification } from "@/lib/telegram-server";
import { cancelSurveyNotification } from "@/lib/survey-notifications";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as any;
  const sessionId = body.sessionId;
  let internalStorageFailed = false;

  if (sessionId) {
    cancelSurveyNotification(sessionId);
  }

  const name = asText(body.name);
  const email = asText(body.email);
  const phone = asText(body.phone);
  const objective = asList(body.objective);
  const level = asText(body.level);
  const location = asText(body.location);
  const difficulty = asList(body.difficulty);
  const bestDay = asList(body.bestDay);
  
  if (!name || !email || !phone || !/\S+@\S+\.\S+/.test(email)) {
    return NextResponse.json({ error: "Dados obrigatorios invalidos no survey." }, { status: 400 });
  }

  try {
    if (sessionId) {
      await upsertSurveyLead({ ...body, sessionId, completed: true });
    } else {
      await appendSurveyLead(body);
    }
  } catch (storageErr) {
    console.error("Erro ao salvar lead de survey:", storageErr);
    // In production environments with ephemeral/read-only filesystems, local persistence may fail.
    // Do not block the survey submission flow because integrations can still be processed.
    internalStorageFailed = true;
  }

  const ghlTags = [
    "website",
    "Survey Submitted",
    ...objective.map((o) => `Goal: ${o}`),
    `Level: ${level}`
  ].filter(Boolean);

  const smsMessage = `Novo Survey Fluenverse!\nNome: ${name}\nTel: ${phone}\nObjetivo: ${objective.join(", ")}\nNível: ${level}\nDificuldade: ${difficulty.join(", ") || "Não informada"}`;
  const telegramMessage = `🚀 <b>Novo Survey Recebido!</b>\n\n` +
    `👤 <b>Nome:</b> ${name}\n` +
    `📧 <b>Email:</b> ${email}\n` +
    `📞 <b>Telefone:</b> ${phone}\n` +
    `📍 <b>Local:</b> ${location || "Não informado"}\n\n` +
    `🎯 <b>Objetivos:</b> ${objective.join(", ") || "Não informado"}\n` +
    `📊 <b>Nível:</b> ${level}\n` +
    `🤔 <b>Dificuldade:</b> ${difficulty.join(", ") || "Não informada"}\n` +
    `📅 <b>Melhores dias:</b> ${bestDay.join(", ") || "Não informado"}`;

  const integrationResults = await Promise.allSettled([
    upsertContact({
      name,
      email,
      phone,
      tags: ghlTags
    }),
    notifyAdmins(smsMessage),
    sendTelegramNotification(telegramMessage),
    (async () => {
      const { config } = await readIntegrationConfig();
      const eventName = config.EVENT_SURVEY_SUBMIT_FB || "Lead";

      await sendFacebookConversionEvent({
        event_name: eventName,
        email: email,
        phone: phone,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" "),
        customData: {
          form_name: "schedule_survey",
          language: body.locale || "pt",
          objective_count: objective.length
        }
      });
    })()
  ]);

  const integrationLabels = ["Go High Level", "Twilio", "Telegram", "Facebook CAPI"] as const;
  let hasSuccessfulIntegration = false;

  integrationResults.forEach((result, index) => {
    if (result.status === "fulfilled") {
      hasSuccessfulIntegration = true;
      return;
    }

    console.error(`Erro ${integrationLabels[index]} survey:`, result.reason);
  });

  if (internalStorageFailed && !hasSuccessfulIntegration) {
    return NextResponse.json(
      { error: "Falha ao salvar o lead e nenhuma integração externa confirmou o envio." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, storedInternally: !internalStorageFailed });
}
