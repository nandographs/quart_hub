"use server";

import { redirect } from "next/navigation";
import { prework } from "@/content/prework";
import { getRespondentByToken, markSubmitted } from "@/lib/repo";

export async function submitPrework(token: string) {
  const respondent = await getRespondentByToken(token);
  if (!respondent) redirect("/");
  const allDone = prework.chapters.every((c) => respondent.chapters_done.includes(c.id));
  if (allDone) await markSubmitted(respondent.id);
  redirect(allDone ? `/r/${token}/obrigado` : `/r/${token}`);
}
