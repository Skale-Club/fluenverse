import { notifyAdmins } from "./twilio-server";
import { sendTelegramNotification } from "./telegram-server";
import { readLeads } from "./leads-store";

// Use a global variable to persist timers across API requests in the same process
const globalNotifications = global as any as {
  activeSurveyNotifications?: Map<string, NodeJS.Timeout>;
};

if (!globalNotifications.activeSurveyNotifications) {
  globalNotifications.activeSurveyNotifications = new Map();
}

const activeNotifications = globalNotifications.activeSurveyNotifications;

export function scheduleSurveyNotification(sessionId: string) {
  // Clear existing timer if any for this session
  if (activeNotifications.has(sessionId)) {
    clearTimeout(activeNotifications.get(sessionId));
  }

  const timer = setTimeout(async () => {
    activeNotifications.delete(sessionId);
    
    // Re-read leads to check status
    const leads = await readLeads();
    const lead = leads.find(l => l.source === 'survey' && l.sessionId === sessionId);
    
    // Only notify if lead exists, is not completed, and has at least some info (like name or email or phone)
    if (lead && !lead.completed && (lead.name || lead.email || lead.phone)) {
      const name = lead.name || "Interessado (Incompleto)";
      const phone = lead.phone || "Não informado";
      const email = lead.email || "Não informado";
      const objective = Array.isArray(lead.objective) ? lead.objective.join(", ") : "Não informado";
      
      const smsMessage = `⚠️ Survey Incompleto (3min parado)!\nNome: ${name}\nTel: ${phone}\nObjetivo: ${objective}`;
      const telegramMessage = `⚠️ <b>Survey Incompleto (Abandonado?)</b>\n\n` +
        `👤 <b>Nome:</b> ${name}\n` +
        `📧 <b>Email:</b> ${email}\n` +
        `📞 <b>Telefone:</b> ${phone}\n` +
        `🎯 <b>Objetivo (parcial):</b> ${objective}\n\n` +
        `⏱️ <i>A pessoa parou de preencher há 3 minutos.</i>`;

      try { 
        await notifyAdmins(smsMessage); 
        console.log(`Notification sent for abandoned survey session ${sessionId}`);
      } catch (err) {
        console.error("Error sending abandoned survey SMS:", err);
      }

      try { 
        await sendTelegramNotification(telegramMessage); 
      } catch (err) {
        console.error("Error sending abandoned survey Telegram:", err);
      }
    }
  }, 3 * 60 * 1000); // 3 minutes

  activeNotifications.set(sessionId, timer);
}

export function cancelSurveyNotification(sessionId: string) {
  if (activeNotifications.has(sessionId)) {
    clearTimeout(activeNotifications.get(sessionId));
    activeNotifications.delete(sessionId);
    console.log(`Cancelled notification for session ${sessionId}`);
  }
}
