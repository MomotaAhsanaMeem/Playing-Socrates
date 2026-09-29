/**
 * app/debrief/page.tsx
 * Debrief — Stage 8 of 8  (Spec §3 §13 §9)
 *
 * Requirements:
 *  - Discloses study purpose
 *  - Lists each planted error with the incorrect claim and the correct fact
 *  - Shows the participant's completion code (first 8 chars of UUID)
 *  - No going back — advancing moves stage to "complete"
 *  - Server component; participant data fetched server-side (condition never shown)
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentParticipant, getParticipantId } from "@/lib/session";
import { PLANTED_ERRORS } from "@/lib/plantedErrors";
import DebriefClient from "./DebriefClient";

export const metadata: Metadata = {
  title: "Study Debrief | Playing Socrates",
  description: "Thank you for participating. Learn about the study and see the correct facts.",
};

export default async function DebriefPage() {
  const pid = await getParticipantId();
  if (!pid) redirect("/consent");

  const participant = await getCurrentParticipant();
  if (!participant) redirect("/consent");

  // Guard: only allow if stage is "debrief"
  if (participant.stage !== "debrief") {
    const stagePaths: Record<string, string> = {
      background: "/background",
      pretest:    "/pretest",
      session:    "/session",
      posttest:   "/posttest",
      trust:      "/trust",
      cogload:    "/cogload",
      complete:   "/complete",
    };
    const path = stagePaths[participant.stage] ?? "/consent";
    redirect(path);
  }

  const completionCode = pid.substring(0, 8).toUpperCase();

  return (
    <DebriefClient
      completionCode={completionCode}
      plantedErrors={PLANTED_ERRORS}
    />
  );
}
