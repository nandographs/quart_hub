import { getChapter } from "@/content/prework";
import { getRespondentByToken, markChapterDone } from "@/lib/repo";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const respondent = typeof body?.token === "string" ? await getRespondentByToken(body.token) : undefined;
  const chapter = typeof body?.chapterId === "string" ? getChapter(body.chapterId) : undefined;
  if (!respondent || !chapter) return Response.json({ error: "Requisição inválida" }, { status: 400 });

  await markChapterDone(respondent.id, chapter.id);
  return Response.json({ ok: true });
}
