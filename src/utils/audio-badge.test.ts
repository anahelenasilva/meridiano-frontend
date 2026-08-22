import { describe, expect, it } from "vitest";
import { audioJobKey, buildAudioJobMap, getAudioBadgeState } from "./audio-badge";
import type { AudioJob } from "@/types";

describe("audioJobKey", () => {
  it("joins source type and id with a colon", () => {
    expect(audioJobKey("article", "a1")).toBe("article:a1");
    expect(audioJobKey("transcription", "t1")).toBe("transcription:t1");
  });
});

describe("getAudioBadgeState", () => {
  it("returns has_audio when has_audio is true, regardless of job state", () => {
    const job: AudioJob = { source_type: "article", source_id: "1", state: "failed", error: "boom" };
    expect(getAudioBadgeState(true, job)).toBe("has_audio");
    expect(getAudioBadgeState(true, undefined)).toBe("has_audio");
  });

  it("returns the job's state when has_audio is false and a job exists", () => {
    const generating: AudioJob = { source_type: "article", source_id: "1", state: "generating", error: null };
    const queued: AudioJob = { source_type: "article", source_id: "1", state: "queued", error: null };
    const failed: AudioJob = { source_type: "article", source_id: "1", state: "failed", error: "boom" };
    expect(getAudioBadgeState(false, generating)).toBe("generating");
    expect(getAudioBadgeState(false, queued)).toBe("queued");
    expect(getAudioBadgeState(false, failed)).toBe("failed");
  });

  it("returns none when there is no audio and no job", () => {
    expect(getAudioBadgeState(false, undefined)).toBe("none");
  });
});

describe("buildAudioJobMap", () => {
  it("keys jobs by source_type:source_id", () => {
    const jobs: AudioJob[] = [
      { source_type: "article", source_id: "a1", state: "queued", error: null },
      { source_type: "transcription", source_id: "t1", state: "generating", error: null },
    ];
    const map = buildAudioJobMap(jobs);
    expect(map.get("article:a1")).toEqual(jobs[0]);
    expect(map.get("transcription:t1")).toEqual(jobs[1]);
    expect(map.size).toBe(2);
  });

  it("returns an empty map for undefined input", () => {
    expect(buildAudioJobMap(undefined).size).toBe(0);
  });
});
