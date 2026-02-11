import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateChannel } from "@/hooks/useApi";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";

const CHANNELS_PATH = "/admin/youtube-channels";

export default function AdminYoutubeChannelAddPage() {
  const navigate = useNavigate();
  const createChannel = useCreateChannel();
  const [channelId, setChannelId] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [maxVideos, setMaxVideos] = useState("");

  const isValid =
    channelId.trim() &&
    name.trim() &&
    url.trim() &&
    description.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    createChannel.mutate(
      {
        channelId: channelId.trim(),
        name: name.trim(),
        url: url.trim(),
        description: description.trim(),
        enabled,
        maxVideos: maxVideos ? Number(maxVideos) : undefined,
      },
      { onSuccess: () => navigate(CHANNELS_PATH) },
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link
        to={CHANNELS_PATH}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Channels
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <Plus className="h-6 w-6 text-primary" />
        <h1 className="font-serif text-2xl sm:text-3xl font-bold">
          Add YouTube Channel
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Add a new YouTube channel to monitor for transcriptions.
      </p>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="mb-1.5">
              Channel ID <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="UC..."
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1.5">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Channel Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1.5">
              URL <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="https://youtube.com/channel/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1.5">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="Channel description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="enabled"
              checked={enabled}
              onCheckedChange={(v) => setEnabled(!!v)}
            />
            <Label htmlFor="enabled" className="cursor-pointer">
              Enabled
            </Label>
          </div>

          <div>
            <Label className="mb-1.5">Max Videos (Optional)</Label>
            <Input
              type="number"
              placeholder="Leave empty to save as null"
              value={maxVideos}
              onChange={(e) => setMaxVideos(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum number of videos to process from this channel
            </p>
          </div>

          <div className="border-t border-border pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(CHANNELS_PATH)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || createChannel.isPending}
            >
              {createChannel.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add Channel
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
