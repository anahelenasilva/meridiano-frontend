import { Button } from "@/components/ui/button";
import { useDismissTranscriptionJob, useFailedTranscriptionJobs } from "@/hooks/useApi";
import { X } from "lucide-react";

/**
 * Videos that never made it through ingest. Queued videos are deliberately not
 * shown: the page is fire and forget, and only failures need your attention.
 */
export default function FailedTranscriptionJobs() {
  const { data } = useFailedTranscriptionJobs();
  const dismissJob = useDismissTranscriptionJob();

  const jobs = data?.jobs ?? [];

  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className="border-destructive/40 bg-destructive/5 mb-6 rounded-md border p-3">
      <p className="text-destructive mb-2 text-sm font-medium">
        {jobs.length} video{jobs.length === 1 ? "" : "s"} failed to process
      </p>
      <ul className="space-y-2">
        {jobs.map((job) => (
          <li key={job.jobId} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-mono text-xs">{job.videoUrl}</p>
              <p className="text-muted-foreground text-xs">
                {job.channelName}. {job.reason}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Dismiss ${job.videoUrl}`}
              disabled={dismissJob.isPending}
              onClick={() => dismissJob.mutate(job.jobId)}
            >
              <X className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
