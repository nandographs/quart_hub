import { findQuestion } from "@/content/prework";
import { getRespondentByToken, saveAnswer } from "@/lib/repo";
import { sanitizeAnswer } from "@/lib/sanitize";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const answers = body?.answers && typeof body.answers === "object" ? body.answers : null;
  if (!token || !answers) return Response.json({ error: "Requisição inválida" }, { status: 400 });

  const respondent = await getRespondentByToken(token);
  if (!respondent) return Response.json({ error: "Link inválido" }, { status: 404 });

  for (const [questionId, raw] of Object.entries(answers)) {
    const found = findQuestion(questionId);
    if (!found) continue;
    await saveAnswer(respondent.id, questionId, sanitizeAnswer(found.question, raw));
  }
  return Response.json({ ok: true });
}
