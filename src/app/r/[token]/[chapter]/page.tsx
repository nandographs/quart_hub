import { notFound } from "next/navigation";
import { getChapter, prework } from "@/content/prework";
import { getAnswers, getRespondentByToken } from "@/lib/repo";
import { ChapterFlow } from "./ChapterFlow";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ token: string; chapter: string }>;
}) {
  const { token, chapter: chapterId } = await params;
  const chapter = getChapter(chapterId);
  const respondent = await getRespondentByToken(token);
  if (!chapter || !respondent) notFound();

  const answers = await getAnswers(respondent.id);
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
        nextChapter={next ? { id: next.id, number: next.number, title: next.title } : null}
        storageMode={process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local"}
      />
    </div>
  );
}
