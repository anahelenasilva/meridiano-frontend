import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomPromptInput } from "@/components/CustomPromptInput";
import { useChannels, useAddTranscriptions } from "@/hooks/useApi";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "@/utils/toast";
import { MESSAGES } from "@/constants/messages";
import { getErrorMessage } from "@/utils/api-error";
import { parseVideoUrls } from "@/utils/parse-video-urls";
import type { EnqueueTranscriptionsResponse } from "@/services/api";

// Mirrors the backend's @ArrayMaxSize on the batch DTO. Guarding here keeps
// the user out of Nest's array-shaped validation error, which the shared
// error parser cannot read.
const MAX_URLS_PER_BATCH = 25;

interface AddTranscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * One toast line covering all three outcomes of a batch. A clean batch spells
 * out what was queued and why; once anything is skipped or rejected the line
 * turns into one short clause per outcome, each carrying its own reason.
 */
function summarizeEnqueueResult(result: EnqueueTranscriptionsResponse): string {
  const { accepted, skipped, rejected } = result;

  if (skipped.length === 0 && rejected.length === 0) {
    return `${accepted.length} ${accepted.length === 1 ? "video" : "videos"} queued for transcription.`;
  }

  const parts = [accepted.length === 0 ? "Nothing queued" : `${accepted.length} queued`];

  if (skipped.length > 0) {
    parts.push(`${skipped.length} skipped (already in your library)`);
  }

  if (rejected.length > 0) {
    parts.push(`${rejected.length} rejected (${rejected[0].reason})`);
  }

  return `${parts.join(", ")}.`;
}

export default function AddTranscriptionModal({
  open,
  onOpenChange,
}: AddTranscriptionModalProps) {
  const [rawUrls, setRawUrls] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generateAudio, setGenerateAudio] = useState(false);

  const urls = useMemo(() => parseVideoUrls(rawUrls), [rawUrls]);
  const isOverCap = urls.length > MAX_URLS_PER_BATCH;

  const { data: channelsData } = useChannels();
  const addTranscriptions = useAddTranscriptions();

  const channels = channelsData?.filter((c) => c.enabled) ?? [];

  const resetForm = () => {
    setRawUrls("");
    setSelectedChannelId("");
    setCustomPrompt("");
    setGenerateAudio(false);
  };

  const handleAddVideos = async () => {
    if (urls.length === 0) {
      toast.error(MESSAGES.VALIDATION.NO_URLS);
      return;
    }
    if (!selectedChannelId) {
      toast.error(MESSAGES.VALIDATION.SELECT_CHANNEL);
      return;
    }

    try {
      const result = await addTranscriptions.mutateAsync({
        urls,
        channelId: selectedChannelId,
        customPrompt: customPrompt.trim() || undefined,
        generateAudio,
      });

      // Nothing queued is not a success: every URL was a duplicate or unreadable.
      const notify = result.accepted.length > 0 ? toast.success : toast.info;
      notify(summarizeEnqueueResult(result));
      onOpenChange(false);
      resetForm();
    } catch (e) {
      toast.error(`${MESSAGES.ERROR.VIDEO_ADD} ${getErrorMessage(e)}`);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add YouTube Videos</DialogTitle>
          <DialogDescription>
            Paste one or more video URLs for a single channel. They are queued and processed in
            the background, so you can close this right away.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label htmlFor="videoUrls" className="text-muted-foreground mb-2 block">
              Video URLs
            </Label>
            <Textarea
              id="videoUrls"
              rows={6}
              placeholder={"https://youtube.com/watch?v=...\nhttps://youtu.be/..."}
              value={rawUrls}
              onChange={(e) => setRawUrls(e.target.value)}
              className="bg-background font-mono text-xs"
              disabled={addTranscriptions.isPending}
            />
            <p
              className={`mt-1 text-xs ${isOverCap ? "text-destructive" : "text-muted-foreground"}`}
            >
              {urls.length === 0
                ? "One URL per line"
                : isOverCap
                  ? `${urls.length} URLs, ${MAX_URLS_PER_BATCH} max per batch. Remove ${urls.length - MAX_URLS_PER_BATCH} to continue.`
                  : `${urls.length} URL${urls.length === 1 ? "" : "s"}`}
            </p>
          </div>

          <div>
            <Label className="text-muted-foreground mb-2 block">Channel</Label>
            <Select
              value={selectedChannelId}
              onValueChange={setSelectedChannelId}
              disabled={addTranscriptions.isPending}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    {channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <CustomPromptInput value={customPrompt} onChange={setCustomPrompt} />

          <div className="flex items-center gap-2">
            <Checkbox
              id="generateAudio"
              checked={generateAudio}
              onCheckedChange={(v) => setGenerateAudio(!!v)}
            />
            <Label htmlFor="generateAudio" className="cursor-pointer text-sm font-normal">
              Generate audio
            </Label>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={addTranscriptions.isPending}
          >
            Close
          </Button>
          <Button
            onClick={handleAddVideos}
            disabled={
              urls.length === 0 ||
              isOverCap ||
              !selectedChannelId ||
              addTranscriptions.isPending
            }
          >
            {addTranscriptions.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            Add Videos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
