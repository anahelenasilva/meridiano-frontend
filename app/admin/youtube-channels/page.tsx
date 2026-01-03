'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Settings } from 'lucide-react';
import { Suspense } from 'react';

import { apiService } from '@/src/services/api';
import type { YoutubeChannel } from '@/src/types/api';

function YoutubeChannelsAdminContent() {
    const queryClient = useQueryClient();

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
            alert(response.data.message || 'Channel updated successfully!');
        },
        onError: (error: Error) => {
            alert(`Error updating channel: ${error.message || 'An error occurred'}`);
        },
    });

    const handleToggle = (channelId: string, currentEnabled: boolean) => {
        updateChannelMutation.mutate({ channelId, enabled: !currentEnabled });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 text-lg mb-4">Error loading channels</div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!channels || channels.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No channels found</div>
            </div>
        );
    }

    // Group channels by enabled status
    const enabledChannels = channels.filter(channel => channel.enabled);
    const disabledChannels = channels.filter(channel => !channel.enabled);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
                <Settings className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">YouTube Channels Admin</h1>
            </div>

            <div className="text-sm text-gray-600 mb-4">
                Manage YouTube channels. Enable or disable channels to control which ones are actively monitored.
            </div>

            {/* Enabled Channels Section */}
            {enabledChannels.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                            {enabledChannels.length}
                        </span>
                        <span>Enabled Channels</span>
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {enabledChannels.map((channel) => (
                            <div
                                key={channel.id}
                                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{channel.name}</h3>
                                        {channel.description && (
                                            <p className="text-sm text-gray-600 mb-3">{channel.description}</p>
                                        )}
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <span className="font-medium">Channel ID:</span>
                                            <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{channel.channelId}</code>
                                        </div>
                                        {channel.maxVideos && (
                                            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                                <span className="font-medium">Max Videos:</span>
                                                <span>{channel.maxVideos}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <a
                                        href={channel.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>View Channel</span>
                                    </a>

                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-gray-700">
                                            {channel.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                        <button
                                            onClick={() => handleToggle(channel.channelId, channel.enabled)}
                                            disabled={updateChannelMutation.isPending}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${channel.enabled ? 'bg-blue-600' : 'bg-gray-200'
                                                }`}
                                            role="switch"
                                            aria-checked={channel.enabled}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${channel.enabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
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
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-800 text-xs font-bold">
                            {disabledChannels.length}
                        </span>
                        <span>Disabled Channels</span>
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {disabledChannels.map((channel) => (
                            <div
                                key={channel.id}
                                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 opacity-75"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{channel.name}</h3>
                                        {channel.description && (
                                            <p className="text-sm text-gray-600 mb-3">{channel.description}</p>
                                        )}
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <span className="font-medium">Channel ID:</span>
                                            <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{channel.channelId}</code>
                                        </div>
                                        {channel.maxVideos && (
                                            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                                <span className="font-medium">Max Videos:</span>
                                                <span>{channel.maxVideos}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <a
                                        href={channel.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>View Channel</span>
                                    </a>

                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-gray-700">
                                            {channel.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                        <button
                                            onClick={() => handleToggle(channel.channelId, channel.enabled)}
                                            disabled={updateChannelMutation.isPending}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${channel.enabled ? 'bg-blue-600' : 'bg-gray-200'
                                                }`}
                                            role="switch"
                                            aria-checked={channel.enabled}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${channel.enabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <YoutubeChannelsAdminContent />
        </Suspense>
    );
}

