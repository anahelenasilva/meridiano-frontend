interface CustomPromptBadgeProps {
  title?: string;
}

export function CustomPromptBadge({
  title = "Has custom instruction",
}: CustomPromptBadgeProps) {
  return (
    <span
      title={title}
      className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    >
      Custom
    </span>
  );
}
