import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useChannels, useToggleChannel } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Settings, Youtube, Loader2, ExternalLink } from "lucide-react";
import type { YouTubeChannel } from "@/types";

export default function AdminYoutubeChannelsPage() {
  const { data: channels, isLoading } = useChannels();
  const toggleChannel = useToggleChannel();

  const channelList = channels ?? [];

  const { enabled, disabled } = useMemo(
    () => ({
      enabled: channelList.filter((c) => c.enabled),
      disabled: channelList.filter((c) => !c.enabled),
    }),
    [channelList],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Settings className="h-7 w-7 text-primary" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            YouTube Channels Admin
          </h1>
        </div>
        <Button asChild>
          <Link to="/admin/youtube-channels/add">
            <Plus className="h-4 w-4" /> Add Channel
          </Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Manage YouTube channels. Enable or disable channels to control which
        ones are actively monitored.
      </p>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge className="bg-green-600 text-primary-foreground hover:bg-green-600">
            {enabled.length}
          </Badge>
          <h2 className="font-semibold text-lg">Enabled Channels</h2>
        </div>
        {enabled.length === 0 && (
          <p className="text-sm text-muted-foreground">No enabled channels.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enabled.map((ch) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              onToggle={() =>
                toggleChannel.mutate({
                  channelId: ch.channelId,
                  enabled: false,
                })
              }
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">{disabled.length}</Badge>
          <h2 className="font-semibold text-lg">Disabled Channels</h2>
        </div>
        {disabled.length === 0 && (
          <p className="text-sm text-muted-foreground">No disabled channels.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disabled.map((ch) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              onToggle={() =>
                toggleChannel.mutate({
                  channelId: ch.channelId,
                  enabled: true,
                })
              }
            />
          ))}
        </div>
      </div>

      {channelList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Youtube className="h-10 w-10 mb-3 opacity-20" />
          <p className="text-sm">No channels added yet.</p>
        </div>
      )}
    </div>
  );
}

function ChannelCard({
  channel,
  onToggle,
}: {
  channel: YouTubeChannel;
  onToggle: () => void;
}) {
  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-base mb-1">{channel.name}</h3>
        {channel.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {channel.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span>Channel ID:</span>
          <code className="bg-secondary px-2 py-0.5 rounded text-xs">
            {channel.channelId}
          </code>
        </div>
        {channel.maxVideos > 0 && (
          <p className="text-xs text-muted-foreground">
            Max Videos: {channel.maxVideos}
          </p>
        )}
      </div>

      <div className="border-t border-border mt-4 pt-3 flex items-center justify-between">
        {channel.url ? (
          <a
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View Channel
          </a>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {channel.enabled ? "Enabled" : "Disabled"}
          </span>
          <Switch checked={channel.enabled} onCheckedChange={onToggle} />
        </div>
      </div>
    </Card>
  );
}
