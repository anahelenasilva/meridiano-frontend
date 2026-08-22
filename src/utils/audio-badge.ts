import type { AudioJob } from "@/types";

export type AudioBadgeState = "has_audio" | "generating" | "queued" | "failed" | "none";

/** Keys audio jobs by source so a list page can look up per-row state in O(1). */
export function buildAudioJobMap(jobs: AudioJob[] | undefined): Map<string, AudioJob> {
  const map = new Map<string, AudioJob>();
  for (const job of jobs ?? []) {
    map.set(`${job.source_type}:${job.source_id}`, job);
  }
  return map;
}

/** has_audio (the DB row) always wins over a stale job entry, per the backend's has_audio/job split. */
export function getAudioBadgeState(hasAudio: boolean, job: AudioJob | undefined): AudioBadgeState {
  if (hasAudio) return "has_audio";
  return job?.state ?? "none";
}
