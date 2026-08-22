import type { AudioBadgeState } from "@/utils/audio-badge";

interface AudioBadgeProps {
  state: AudioBadgeState;
}

const STATE_CONFIG: Record<Exclude<AudioBadgeState, "none">, { label: string; title: string; className: string }> = {
  has_audio: {
    label: "Audio",
    title: "Has an Audio Summary",
    className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  generating: {
    label: "Generating",
    title: "Audio Summary is generating",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  queued: {
    label: "Queued",
    title: "Audio Summary is queued",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  failed: {
    label: "Failed",
    title: "Audio Summary generation failed",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};

/**
 * Renders nothing for "none". Otherwise a presentational badge, like
 * CategoryBadge/CustomPromptBadge: it relies on the row it's placed in
 * already linking to the item's detail page, rather than nesting its own
 * anchor inside that row's link.
 */
export function AudioBadge({ state }: AudioBadgeProps) {
  if (state === "none") return null;

  const config = STATE_CONFIG[state];

  return (
    <span
      title={config.title}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
