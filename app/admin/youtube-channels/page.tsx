'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ExternalLink, Loader2, Plus, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState } from 'react';

import { MESSAGES } from '@/src/constants/messages';
import { apiService } from '@/src/services/api';
import type { YoutubeChannel } from '@/src/types/api';
import { toast } from '@/src/utils/toast';

function YoutubeChannelsAdminContent() {
  const queryClient = useQueryClient();
  const [pendingChannelId, setPendingChannelId] = useState<string | null>(null);

  const { data: channels, isLoading, error } = useQuery<YoutubeChannel[]>({
    queryKey: ['youtube-channels'],
    queryFn: async () => {
      const response = await apiService.getYoutubeChannels();
      return response.data;
    },
  });

  const updateChannelMutation = useMutation({
    mutationFn: ({ channelId, enabled }: { channelId: string; enabled: boolean }) =>
      apiService.updateChannelEnabled(channelId, enabled),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['youtube-channels'] });
      setPendingChannelId(null);
      toast.success(response.data.message || MESSAGES.SUCCESS.CHANNEL_UPDATED);
    },
    onError: (error: Error) => {
      setPendingChannelId(null);
      toast.error(`${MESSAGES.ERROR.CHANNEL_UPDATE} ${error.message || MESSAGES.ERROR.GENERIC}`);
    },
  });

  const handleToggle = (channelId: string, currentEnabled: boolean) => {
    setPendingChannelId(channelId);
    updateChannelMutation.mutate({ channelId, enabled: !currentEnabled });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 text-lg mb-4">Error loading channels</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg">No channels found</div>
      </div>
    );
  }

  // Group channels by enabled status
  const enabledChannels = channels.filter(channel => channel.enabled);
  const disabledChannels = channels.filter(channel => !channel.enabled);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">YouTube Channels Admin</h1>
        </div>
        <Link
          href="/admin/youtube-channels/add"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Channel
        </Link>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Manage YouTube channels. Enable or disable channels to control which ones are actively monitored.
      </div>

      {/* Enabled Channels Section */}
      {enabledChannels.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-bold">
              {enabledChannels.length}
            </span>
            <span>Enabled Channels</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {enabledChannels.map((channel) => (
              <div
                key={channel.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{channel.name}</h3>
                    {channel.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{channel.description}</p>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Channel ID:</span>
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-800 dark:text-gray-300">{channel.channelId}</code>
                    </div>
                    {channel.maxVideos && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="font-medium">Max Videos:</span>
                        <span>{channel.maxVideos}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Channel</span>
                  </a>

                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium transition-colors ${channel.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {channel.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => handleToggle(channel.id, channel.enabled)}
                      disabled={pendingChannelId === channel.id}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${
                        channel.enabled
                          ? 'bg-green-500 dark:bg-green-600 focus:ring-green-500 shadow-lg shadow-green-500/30 dark:shadow-green-600/30'
                          : 'bg-gray-300 dark:bg-gray-600 focus:ring-gray-400'
                      }`}
                      role="switch"
                      aria-checked={channel.enabled}
                    >
                      {pendingChannelId === channel.id ? (
                        <Loader2 className="h-3.5 w-3.5 text-white animate-spin absolute" />
                      ) : (
                        <span
                          className={`inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white transition-all duration-200 shadow-md ${
                            channel.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        >
                          {channel.enabled ? (
                            <Check className="h-3 w-3 text-green-600 dark:text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          )}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disabled Channels Section */}
      {disabledChannels.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-bold">
              {disabledChannels.length}
            </span>
            <span>Disabled Channels</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {disabledChannels.map((channel) => (
              <div
                key={channel.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-6 opacity-75"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{channel.name}</h3>
                    {channel.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{channel.description}</p>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Channel ID:</span>
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-800 dark:text-gray-300">{channel.channelId}</code>
                    </div>
                    {channel.maxVideos && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="font-medium">Max Videos:</span>
                        <span>{channel.maxVideos}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Channel</span>
                  </a>

                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium transition-colors ${channel.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {channel.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => handleToggle(channel.id, channel.enabled)}
                      disabled={pendingChannelId === channel.id}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${
                        channel.enabled
                          ? 'bg-green-500 dark:bg-green-600 focus:ring-green-500 shadow-lg shadow-green-500/30 dark:shadow-green-600/30'
                          : 'bg-gray-300 dark:bg-gray-600 focus:ring-gray-400'
                      }`}
                      role="switch"
                      aria-checked={channel.enabled}
                    >
                      {pendingChannelId === channel.id ? (
                        <Loader2 className="h-3.5 w-3.5 text-white animate-spin absolute" />
                      ) : (
                        <span
                          className={`inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white transition-all duration-200 shadow-md ${
                            channel.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        >
                          {channel.enabled ? (
                            <Check className="h-3 w-3 text-green-600 dark:text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          )}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function YoutubeChannelsAdminPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    }>
      <YoutubeChannelsAdminContent />
    </Suspense>
  );
}
