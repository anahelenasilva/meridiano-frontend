'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ExternalLink, Eye, Plus, TrashIcon, X } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { Suspense, useCallback, useState } from 'react';

import { YoutubeThumbnail } from '@/src/components/YoutubeThumbnail';
import { apiService } from '@/src/services/api';
import type { YoutubeChannel, YoutubeTranscription, YoutubeTranscriptionsResponse } from '@/src/types/api';
import { toast } from '@/src/utils/toast';
import { MESSAGES } from '@/src/constants/messages';

function YoutubeTranscriptionsContent() {
  const queryClient = useQueryClient();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');

  // Channel grouping state - track which channels are expanded (default: all collapsed)
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());

  // Helper function to group transcriptions by channel
  const groupTranscriptionsByChannel = useCallback((transcriptions: YoutubeTranscription[]) => {
    const grouped = new Map<string, YoutubeTranscription[]>();

    transcriptions.forEach((transcription) => {
      const channelId = transcription.channelId;
      if (!grouped.has(channelId)) {
        grouped.set(channelId, []);
      }

      grouped.get(channelId)!.push(transcription);
    });

    const groupedSorted = Array.from(grouped).sort((a, b) => b[1].length - a[1].length);
    return groupedSorted;
  }, []);

  // Toggle channel expand/collapse
  const toggleChannel = useCallback((channelId: string) => {
    setExpandedChannels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(channelId)) {
        newSet.delete(channelId);
      } else {
        newSet.add(channelId);
      }
      return newSet;
    });
  }, []);

  const { data, isLoading, error } = useQuery<YoutubeTranscriptionsResponse>({
    queryKey: ['youtube-transcriptions'],
    queryFn: async () => {
      const response = await apiService.getYoutubeTranscriptions();
      return response.data;
    },
  });

  const { data: channelsData } = useQuery<YoutubeChannel[]>({
    queryKey: ['youtube-channels'],
    queryFn: async () => {
      const response = await apiService.getYoutubeChannels();
      return response.data;
    },
  });

  const addVideoMutation = useMutation({
    mutationFn: ({ url, channelId }: { url: string; channelId: string }) =>
      apiService.addYoutubeTranscription(url, channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-transcriptions'] });
      setIsModalOpen(false);
      setVideoUrl('');
      setSelectedChannelId('');
      toast.success(MESSAGES.SUCCESS.VIDEO_ADDED);
    },
    onError: (error: Error) => {
      toast.error(`${MESSAGES.ERROR.VIDEO_ADD} ${error.message || MESSAGES.ERROR.GENERIC}`);
    },
  });

  const deleteTranscription = async (transcriptionId: string) => {
    if (!confirm(MESSAGES.CONFIRM.DELETE_TRANSCRIPTION)) {
      return;
    }

    await apiService.deleteYoutubeTranscription(transcriptionId);
    toast.success(MESSAGES.SUCCESS.TRANSCRIPTION_DELETED);

    // Reload the page
    window.location.reload();
  };

  const handleAddVideo = () => {
    if (!videoUrl.trim()) {
      toast.error(MESSAGES.VALIDATION.INVALID_URL);
      return;
    }
    if (!selectedChannelId) {
      toast.error(MESSAGES.VALIDATION.SELECT_CHANNEL);
      return;
    }
    addVideoMutation.mutate({ url: videoUrl, channelId: selectedChannelId });
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
        <div className="text-red-600 dark:text-red-400 text-lg mb-4">Error loading transcriptions</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const { transcriptions } = data || {
    transcriptions: [],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          YouTube Transcriptions
        </h1>
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Add Video</span>
          </button>
        </div>
      </div>

      {/* Transcriptions Grid */}
      {transcriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg">No transcriptions found</div>
        </div>
      ) : (
        // Grouped view by channel when no channel filter is active
        <div className="space-y-4">
          {Array.from(groupTranscriptionsByChannel(transcriptions)).map(([channelId, channelTranscriptions]) => {
            const isExpanded = expandedChannels.has(channelId);
            const channelName = channelTranscriptions[0]?.channelName || 'Unknown Channel';

            return (
              <div key={channelId} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Channel Header - Collapsible */}
                <button
                  onClick={() => toggleChannel(channelId)}
                  className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  aria-expanded={isExpanded}
                  aria-controls={`channel-content-${channelId}`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className={`transform transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <svg role="img" className='h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400 flex-shrink-0' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                      <title>YouTube</title>
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{channelName}</h2>
                    <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 flex-shrink-0">
                      {channelTranscriptions.length} {channelTranscriptions.length === 1 ? 'video' : 'videos'}
                    </span>
                  </div>
                </button>

                {/* Channel Transcriptions - Expandable */}
                {isExpanded && (
                  <div
                    id={`channel-content-${channelId}`}
                    className="p-3 sm:p-4 pt-0 border-t border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-3 sm:mt-4">
                      {channelTranscriptions.map((transcription) => (
                        <div
                          key={transcription.id}
                          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                          <Link href={`/youtube-transcription/${transcription.id}`}>
                            <div className="h-40 sm:h-48 overflow-hidden relative">
                              <YoutubeThumbnail
                                videoUrl={transcription.videoUrl}
                                alt={transcription.videoTitle}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </Link>

                          <div className="p-4 sm:p-6">
                            <div className="flex items-start justify-between mb-2 sm:mb-3">
                              <div className="flex-1">
                                <Link
                                  href={`/youtube-transcription/${transcription.id}`}
                                  className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                                >
                                  {transcription.videoTitle}
                                </Link>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              {transcription.postedAt && (
                                <span>{moment(transcription.postedAt).format('MMM D, YYYY')}</span>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                Processed: {moment(transcription.processedAt).format('MMM D, YYYY')}
                              </span>
                            </div>

                            {transcription.transcriptionSummary && (
                              <div className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                                {transcription.transcriptionSummary}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/youtube-transcription/${transcription.id}`}
                                className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 dark:bg-blue-500 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">View Details</span>
                                <span className="sm:hidden">View</span>
                              </Link>
                              <a
                                href={transcription.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs sm:text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Watch Video</span>
                                <span className="sm:hidden">Watch</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => deleteTranscription(transcription.id)}
                                className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                              >
                                <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Delete</span>
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
          })}
        </div>
      )}

      {/* Add Video Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-20 dark:bg-gray-900 dark:bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add YouTube Video</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video URL
                </label>
                <input
                  id="video-url"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700"
                  disabled={addVideoMutation.isPending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVideo();
                    }
                  }}
                />
              </div>

              <div>
                <label htmlFor="channel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Channel
                </label>
                <select
                  id="channel"
                  value={selectedChannelId}
                  onChange={(e) => setSelectedChannelId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-gray-300 [&:has(option:checked:not([value='']))]:text-gray-900 dark:[&:has(option:checked:not([value='']))]:text-gray-100 bg-white dark:bg-gray-700"
                  disabled={addVideoMutation.isPending}
                >
                  <option value="">Select a channel</option>
                  {channelsData?.filter(channel => channel.enabled).map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={addVideoMutation.isPending}
                >
                  Close
                </button>
                <button
                  onClick={handleAddVideo}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={addVideoMutation.isPending}
                >
                  {addVideoMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Video</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function YoutubeTranscriptionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    }>
      <YoutubeTranscriptionsContent />
    </Suspense>
  );
}
