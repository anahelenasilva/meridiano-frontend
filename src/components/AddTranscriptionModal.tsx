import { useState } from "react";
import { useChannels, useAddTranscription } from "@/hooks/useApi";
import { Input } from "@/components/ui/input";
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

interface AddTranscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return MESSAGES.ERROR.GENERIC;
}

export default function AddTranscriptionModal({
  open,
  onOpenChange,
}: AddTranscriptionModalProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState("");

  const { data: channelsData } = useChannels();
  const addTranscription = useAddTranscription();

  const channels = channelsData?.filter((c) => c.enabled) ?? [];

  const handleAddVideo = async () => {
    if (!videoUrl.trim()) {
      toast.error(MESSAGES.VALIDATION.INVALID_URL);
      return;
    }
    if (!selectedChannelId) {
      toast.error(MESSAGES.VALIDATION.SELECT_CHANNEL);
      return;
    }

    try {
      await addTranscription.mutateAsync({
        url: videoUrl.trim(),
        channelId: selectedChannelId,
      });
      toast.success(MESSAGES.SUCCESS.VIDEO_ADDED);
      onOpenChange(false);
      setVideoUrl("");
      setSelectedChannelId("");
    } catch (e) {
      toast.error(`${MESSAGES.ERROR.VIDEO_ADD} ${getErrorMessage(e)}`);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setVideoUrl("");
      setSelectedChannelId("");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add YouTube Video</DialogTitle>
          <DialogDescription>
            Enter a YouTube video URL and select the channel. The transcription will be processed shortly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label className="text-muted-foreground mb-2 block">Video URL</Label>
            <Input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="bg-background"
              disabled={addTranscription.isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddVideo();
                }
              }}
            />
          </div>

          <div>
            <Label className="text-muted-foreground mb-2 block">Channel</Label>
            <Select
              value={selectedChannelId}
              onValueChange={setSelectedChannelId}
              disabled={addTranscription.isPending}
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
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={addTranscription.isPending}
          >
            Close
          </Button>
          <Button
            onClick={handleAddVideo}
            disabled={
              !videoUrl.trim() ||
              !selectedChannelId ||
              addTranscription.isPending
            }
          >
            {addTranscription.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            Add Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
