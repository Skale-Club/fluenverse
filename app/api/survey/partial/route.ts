import { NextResponse } from "next/server";
import { upsertSurveyLead } from "@/lib/leads-store";
import { scheduleSurveyNotification } from "@/lib/survey-notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, ...data } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Save the partial data
    await upsertSurveyLead({
      ...data,
      sessionId,
      completed: false
    });

    // Schedule or reset the 3-minute timer
    scheduleSurveyNotification(sessionId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in survey partial save:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
