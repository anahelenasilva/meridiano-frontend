'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ExternalLink, Eye, Plus, TrashIcon, X } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useState } from 'react';

import { YoutubeThumbnail } from '@/src/components/YoutubeThumbnail';
import { apiService } from '@/src/services/api';
import type { YoutubeChannel, YoutubeTranscription, YoutubeTranscriptionsResponse } from '@/src/types/api';

function YoutubeTranscriptionsContent() {
  const router = useRouter();
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
      alert('Video added successfully! Transcription will be processed shortly.');
    },
    onError: (error: Error) => {
      alert(`Error adding video: ${error.message || 'An error occurred'}`);
    },
  });

  const deleteTranscription = async (transcriptionId: number) => {
    if (!confirm('Are you sure you want to delete this transcription?')) {
      return;
    }
    
    await apiService.deleteYoutubeTranscription(transcriptionId);
    alert('Transcription deleted successfully');

    // Reload the page
    window.location.reload();
  };

  const handleAddVideo = () => {
    if (!videoUrl.trim()) {
      alert('Please enter a valid URL');
      return;
    }
    if (!selectedChannelId) {
      alert('Please select a channel');
      return;
    }
    addVideoMutation.mutate({ url: videoUrl, channelId: selectedChannelId });
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
        <div className="text-red-600 text-lg mb-4">Error loading transcriptions</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { transcriptions,  available_channels } = data || {
    transcriptions: [],
    pagination: { page: 1, per_page: 20, total_pages: 0, total_transcriptions: 0 },
    available_channels: []
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Video</span>
          </button>
        </div>
      </div>

      {/* Transcriptions Grid */}
      {transcriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No transcriptions found</div>
        </div>
      ) : (
        // Grouped view by channel when no channel filter is active
        <div className="space-y-4">
          {Array.from(groupTranscriptionsByChannel(transcriptions)).map(([channelId, channelTranscriptions]) => {
            const isExpanded = expandedChannels.has(channelId);
            const channelName = channelTranscriptions[0]?.channelName || 'Unknown Channel';
            
            return (
              <div key={channelId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Channel Header - Collapsible */}
                <button
                  onClick={() => toggleChannel(channelId)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  aria-expanded={isExpanded}
                  aria-controls={`channel-content-${channelId}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    </div>
                    <svg role="img" className='h-5 w-5 text-red-600' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                      <title>YouTube</title>
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <h2 className="text-xl font-bold text-gray-900">{channelName}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {channelTranscriptions.length} {channelTranscriptions.length === 1 ? 'video' : 'videos'}
                    </span>
                  </div>
                </button>

                {/* Channel Transcriptions - Expandable */}
                {isExpanded && (
                  <div 
                    id={`channel-content-${channelId}`}
                    className="p-4 pt-0 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                      {channelTranscriptions.map((transcription) => (
                        <div
                          key={transcription.id}
                          className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                          <Link href={`/youtube-transcription/${transcription.id}`}>
                            <div className="h-48 overflow-hidden relative">
                              <YoutubeThumbnail
                                videoUrl={transcription.videoUrl}
                                alt={transcription.videoTitle}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </Link>

                          <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <Link
                                  href={`/youtube-transcription/${transcription.id}`}
                                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                                >
                                  {transcription.videoTitle}
                                </Link>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                              {transcription.postedAt && (
                                <span>{moment(transcription.postedAt).format('MMM D, YYYY')}</span>
                              )}
                              <span className="text-xs text-gray-500">
                                Processed: {moment(transcription.processedAt).format('MMM D, YYYY')}
                              </span>
                            </div>

                            {transcription.transcriptionSummary && (
                              <div className="text-gray-700 text-sm mb-4 line-clamp-3">
                                {transcription.transcriptionSummary}
                              </div>
                            )}

                            <div className="flex items-center space-x-3">
                              <Link
                                href={`/youtube-transcription/${transcription.id}`}
                                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View Details</span>
                              </Link>
                              <a
                                href={transcription.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>Watch Video</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => deleteTranscription(transcription.id)}
                                className="flex items-center space-x-1 px-3 py-2 text-sm border rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                                <span>Delete</span>
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
          className="fixed inset-0 bg-gray-500 bg-opacity-20 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add YouTube Video</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <input
                  id="video-url"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 text-gray-700"
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
                <label htmlFor="channel" className="block text-sm font-medium text-gray-700 mb-2">
                  Channel
                </label>
                <select
                  id="channel"
                  value={selectedChannelId}
                  onChange={(e) => setSelectedChannelId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 [&:has(option:checked:not([value='']))]:text-gray-900"
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
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={addVideoMutation.isPending}
                >
                  Close
                </button>
                <button
                  onClick={handleAddVideo}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <YoutubeTranscriptionsContent />
    </Suspense>
  );
}
