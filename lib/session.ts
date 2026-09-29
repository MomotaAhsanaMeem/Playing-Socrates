/**
 * lib/session.ts (updated)
 * Server-side participant session helpers.
 * Stores participant UUID in "ps_pid" and stage in "ps_stage" (for middleware).
 * Both cookies are HttpOnly and never accessible to client-side JS.
 */
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

const PID_COOKIE   = "ps_pid";
const STAGE_COOKIE = "ps_stage";

const COOKIE_BASE = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure:   process.env.NODE_ENV === "production",
  path:     "/",
  maxAge:   60 * 60 * 48, // 48 h
};

export async function getParticipantId(): Promise<string | null> {
  const store = await cookies();
  return store.get(PID_COOKIE)?.value ?? null;
}

export async function setSession(id: string, stage: string): Promise<void> {
  const store = await cookies();
  store.set(PID_COOKIE,   id,    COOKIE_BASE);
  store.set(STAGE_COOKIE, stage, COOKIE_BASE);
}

export async function updateStage(stage: string): Promise<void> {
  const store = await cookies();
  store.set(STAGE_COOKIE, stage, COOKIE_BASE);
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(PID_COOKIE,   "", { ...COOKIE_BASE, maxAge: 0 });
  store.set(STAGE_COOKIE, "", { ...COOKIE_BASE, maxAge: 0 });
}

export async function getCurrentParticipant() {
  const id = await getParticipantId();
  if (!id) return null;
  const { data } = await supabase
    .from("participants")
    .select("*")
    .eq("id", id)
    .single();
  return data ?? null;
}

/**
 * Advances stage in DB + updates ps_stage cookie so middleware redirects correctly.
 * Records end of previous stage and start of new stage in stage_times.
 */
export async function advanceStage(
  participantId: string,
  fromStage: string,
  toStage: string
): Promise<void> {
  const now = new Date().toISOString();
  await Promise.all([
    supabase.from("stage_times")
      .update({ ended_at: now })
      .eq("participant_id", participantId)
      .eq("stage", fromStage)
      .is("ended_at", null),
    supabase.from("participants")
      .update({ stage: toStage })
      .eq("id", participantId),
  ]);
  await supabase.from("stage_times")
    .insert({ participant_id: participantId, stage: toStage, started_at: now });
  // Update the stage cookie so middleware reflects the new stage immediately
  await updateStage(toStage);
}
