import type { Briefing } from "@/types";
import { format } from "date-fns";

export function getBriefingCustomTitle(briefing: Briefing): string | null {
  const customTitle = briefing.customTitle ?? briefing.custom_title;
  return customTitle?.trim() || null;
}

export function isCustomBriefing(briefing: Briefing): boolean {
  return Boolean(briefing.isCustom ?? briefing.is_custom);
}

export function getDefaultBriefingTitle(briefing: Briefing): string {
  const generatedAt = briefing.generated_at
    ? format(new Date(briefing.generated_at), "MMM d, yyyy")
    : "Unknown date";

  return `Briefing — ${briefing.feed_profile} — ${generatedAt}`;
}

export function getBriefingTitle(briefing: Briefing): string {
  const customTitle = getBriefingCustomTitle(briefing);

  if (isCustomBriefing(briefing) && customTitle) {
    return customTitle;
  }

  return getDefaultBriefingTitle(briefing);
}
