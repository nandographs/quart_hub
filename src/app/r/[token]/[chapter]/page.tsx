import { notFound } from "next/navigation";
import { getChapter, prework } from "@/content/prework";
import { getAnswers, getRespondentByToken } from "@/lib/repo";
import { ChapterFlow } from "./ChapterFlow";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string; chapter: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { token, chapter: chapterId } = await params;
  const { q } = await searchParams;
  const chapter = getChapter(chapterId);
  const respondent = await getRespondentByToken(token);
  if (!chapter || !respondent) notFound();

  const answers = await getAnswers(respondent.id);
  const step = Math.min(Math.max(Number.parseInt(q ?? "0", 10) || 0, 0), chapter.questions.length);

  // Próximo capítulo ainda não concluído, na ordem do roteiro (dando a volta)
  const index = prework.chapters.indexOf(chapter);
  const ordered = [...prework.chapters.slice(index + 1), ...prework.chapters.slice(0, index)];
  const next = ordered.find((c) => !respondent.chapters_done.includes(c.id));

  return (
    <div className="stage">
      <ChapterFlow
        token={token}
        chapter={chapter}
        initialAnswers={answers}
        initialStep={step}
        nextChapter={next ? { id: next.id, number: next.number, title: next.title } : null}
        storageMode={process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local"}
      />
    </div>
  );
}
