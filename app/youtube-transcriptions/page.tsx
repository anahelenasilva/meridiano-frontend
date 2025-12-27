'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, ChevronDown, ExternalLink, Eye, Plus, Search, TrashIcon, X } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { YoutubeThumbnail } from '@/src/components/YoutubeThumbnail';
import { apiService } from '@/src/services/api';
import type { YoutubeChannel, YoutubeTranscription, YoutubeTranscriptionsResponse } from '@/src/types/api';

function YoutubeTranscriptionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // URL state management
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    sort_by: searchParams.get('sort_by') || 'postedAt',
    direction: (searchParams.get('direction') || 'desc') as 'asc' | 'desc',
    channel_id: searchParams.get('channel_id') || '',
    channel_name: searchParams.get('channel_name') || '',
    search: searchParams.get('search') || '',
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || '',
    preset: searchParams.get('preset') || '',
  });

  // Local search input state for debouncing
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');

  // Channel grouping state - track which channels are expanded (default: all collapsed)
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());

  const updateFilter = useCallback((key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 1 }) // Reset to page 1 when other filters change
    }));
  }, []);

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

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (searchInput !== filters.search) {
        updateFilter('search', searchInput);
      }
    }, 500); // 500ms delay

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchInput, filters.search, updateFilter]);

  // Update URL when filters change (except for search input changes)
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });
    router.replace(`/youtube-transcriptions?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  const { data, isLoading, error } = useQuery<YoutubeTranscriptionsResponse>({
    queryKey: ['youtube-transcriptions', filters],
    queryFn: async () => {
      const response = await apiService.getYoutubeTranscriptions(filters);
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

  const handlePresetDate = (preset: string) => {
    updateFilter('preset', preset);
    // Clear individual date filters when using preset
    setFilters(prev => ({ ...prev, start_date: '', end_date: '', preset }));
  };

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

  const { transcriptions, pagination, available_channels } = data || {
    transcriptions: [],
    pagination: { page: 1, per_page: 20, total_pages: 0, total_transcriptions: 0 },
    available_channels: []
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            YouTube Transcriptions
            {filters.channel_name && (
              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {filters.channel_name}
              </span>
            )}
          </h1>
          {pagination.total_transcriptions > 0 && (
            <p className="text-gray-600">
              Showing {(pagination.page - 1) * pagination.per_page + 1} - {Math.min(pagination.page * pagination.per_page, pagination.total_transcriptions)} of {pagination.total_transcriptions} transcriptions
            </p>
          )}
        </div>
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

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        {/* Search and Channel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transcriptions..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filters.channel_name}
              onChange={(e) => {
                const channelName = e.target.value;
                const channel = available_channels.find(ch => ch.name === channelName);
                setFilters(prev => ({
                  ...prev,
                  channel_name: channelName,
                  channel_id: channel?.id || '',
                  page: 1
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500 [&:has(option:checked:not([value='']))]:text-gray-900"
            >
              <option value="">All Channels</option>
              {available_channels.map((channel) => (
                <option key={channel.id} value={channel.name}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filters */}
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            <div className="flex space-x-2">
              {['yesterday', 'last_week', 'last_30d', 'last_3m'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetDate(preset)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filters.preset === preset
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.replace('_', ' ').replace('last ', 'Last ')}
                </button>
              ))}
            </div>
          </div>
          <div className="flex space-x-4">
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => updateFilter('start_date', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
            />
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => updateFilter('end_date', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
            />
          </div>
        </div>

        {/* Sorting */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={filters.sort_by}
            onChange={(e) => updateFilter('sort_by', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="postedAt">Posted Date</option>
            <option value="processedAt">Processed Date</option>
            <option value="videoTitle">Video Title</option>
            <option value="channelName">Channel Name</option>
          </select>
          <select
            value={filters.direction}
            onChange={(e) => updateFilter('direction', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Transcriptions Grid */}
      {transcriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No transcriptions found</div>
        </div>
      ) : !filters.channel_id ? (
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
      ) : (
        // Flat grid view when channel filter is active
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {transcriptions.map((transcription) => (
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
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                  <svg role="img" className='h-3 w-3 mr-1' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>YouTube</title><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    {/* <Youtube className="h-3 w-3 mr-1" /> */}
                    {transcription.channelName}
                  </span>
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
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          {pagination.page > 1 && (
            <button
              onClick={() => updateFilter('page', pagination.page - 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          )}

          <span className="px-4 py-2 text-gray-700">
            Page {pagination.page} of {pagination.total_pages}
          </span>

          {pagination.page < pagination.total_pages && (
            <button
              onClick={() => updateFilter('page', pagination.page + 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          )}
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
