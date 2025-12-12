'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar, ExternalLink, Eye, Search, TrashIcon } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { apiService } from '@/src/services/api';
import type { YoutubeTranscriptionsResponse } from '@/src/types/api';

export default function YoutubeTranscriptionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const updateFilter = useCallback((key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 1 }) // Reset to page 1 when other filters change
    }));
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {transcriptions.map((transcription) => (
            <div
              key={transcription.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
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
    </div>
  );
}
