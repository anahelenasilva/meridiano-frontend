'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, ExternalLink, Eye, Plus, Search, TrashIcon, X } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import BookmarkButton from '@/src/components/BookmarkButton';
import { MESSAGES } from '@/src/constants/messages';
import { apiService } from '@/src/services/api';
import type { ArticlesResponse } from '@/src/types/api';
import { uploadToS3, validateMarkdownFile } from '@/src/utils/s3';
import { toast } from '@/src/utils/toast';

function ArticlesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    sortBy: searchParams.get('sortBy') || 'published_date',
    direction: (searchParams.get('direction') || 'desc') as 'asc' | 'desc',
    feedProfile: searchParams.get('feedProfile') || '',
    searchTerm: searchParams.get('searchTerm') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    preset: searchParams.get('preset') || '',
    category: searchParams.get('category') || '',
  });

  const [searchInput, setSearchInput] = useState(filters.searchTerm);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleUrl, setArticleUrl] = useState('');
  const [articleFeedProfile, setArticleFeedProfile] = useState('');
  const [uploadMode, setUploadMode] = useState<'link' | 'upload'>('link');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const updateFilter = useCallback((key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 1 })
    }));
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (searchInput !== filters.searchTerm) {
        updateFilter('searchTerm', searchInput);
      }
    }, 500); // 500ms delay

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchInput, filters.searchTerm, updateFilter]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });

    router.replace(`/articles?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  const { data, isLoading, error } = useQuery<ArticlesResponse>({
    queryKey: ['articles', JSON.stringify(filters)],
    queryFn: async () => {
      const response = await apiService.getArticles(filters);
      return response.data;
    },
  });

  const addArticleMutation = useMutation({
    mutationFn: ({ url, feedProfile }: { url: string; feedProfile: string }) =>
      apiService.addArticle(url, feedProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setIsModalOpen(false);
      setArticleUrl('');
      setArticleFeedProfile('');
      setUploadMode('link');
      setSelectedFile(null);
      toast.success(MESSAGES.SUCCESS.ARTICLE_ADDED);
    },
    onError: (error: Error) => {
      toast.error(`${MESSAGES.ERROR.ARTICLE_ADD} ${error.message || MESSAGES.ERROR.GENERIC}`);
    },
  });

  const uploadMarkdownMutation = useMutation({
    mutationFn: async ({ file, feedProfile }: { file: File; feedProfile: string }) => {
      setIsUploading(true);
      try {
        const presignedUrlResponse = await apiService.getPresignedUrl(file.name);
        const { url, fields } = presignedUrlResponse.data;
        const s3Key = fields.key;

        await uploadToS3(url, fields, file);

        return await apiService.addArticleFromMarkdown(s3Key, feedProfile);
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setIsModalOpen(false);
      setArticleUrl('');
      setArticleFeedProfile('');
      setUploadMode('link');
      setSelectedFile(null);
      toast.success(MESSAGES.SUCCESS.MARKDOWN_UPLOADED);
    },
    onError: (error: Error) => {
      toast.error(`${MESSAGES.ERROR.MARKDOWN_UPLOAD} ${error.message || MESSAGES.ERROR.GENERIC}`);
    },
  });

  const handlePresetDate = (preset: string) => {
    updateFilter('preset', preset);
    setFilters(prev => ({ ...prev, startDate: '', endDate: '', preset }));
  };

  const deleteArticle = async (articleId: string) => {
    await apiService.deleteArticle(articleId);
    toast.success(MESSAGES.SUCCESS.ARTICLE_DELETED);

    router.push('/articles');
  };

  const handleAddArticle = () => {
    if (!articleFeedProfile) {
      toast.error(MESSAGES.VALIDATION.SELECT_FEED_PROFILE);
      return;
    }

    if (uploadMode === 'link') {
      if (!articleUrl.trim()) {
        toast.error(MESSAGES.VALIDATION.INVALID_URL);
        return;
      }
      addArticleMutation.mutate({ url: articleUrl, feedProfile: articleFeedProfile });
    } else {
      if (!selectedFile) {
        toast.error(MESSAGES.VALIDATION.SELECT_FILE);
        return;
      }
      if (!validateMarkdownFile(selectedFile)) {
        toast.error(MESSAGES.VALIDATION.INVALID_FILE_TYPE);
        return;
      }
      uploadMarkdownMutation.mutate({ file: selectedFile, feedProfile: articleFeedProfile });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateMarkdownFile(file)) {
        toast.error(MESSAGES.VALIDATION.INVALID_FILE_TYPE);
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
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
        <div className="text-red-600 text-lg mb-4">Error loading articles</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { articles, pagination, available_profiles, available_categories } = data || {
    articles: [],
    pagination: { page: 1, per_page: 20, total_pages: 0, total_articles: 0 },
    available_profiles: [],
    available_categories: []
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Articles
            {filters.feedProfile && (
              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {filters.feedProfile}
              </span>
            )}
            {filters.category && (
              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {filters.category}
              </span>
            )}
          </h1>
          {pagination.total_articles > 0 && (
            <p className="text-gray-600">
              Showing {(pagination.page - 1) * pagination.per_page + 1} - {Math.min(pagination.page * pagination.per_page, pagination.total_articles)} of {pagination.total_articles} articles
            </p>
          )}
        </div>
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Article</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        {/* Search and Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 text-gray-700"
              />
            </div>
          </div>
          <div>
            <select
              value={filters.feedProfile}
              onChange={(e) => updateFilter('feedProfile', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500 [&:has(option:checked:not([value='']))]:text-gray-900"
            >
              <option value="">All Profiles</option>
              {available_profiles.map((profile) => (
                <option key={profile} value={profile}>
                  {profile}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500 [&:has(option:checked:not([value='']))]:text-gray-900"
            >
              <option value="">All Categories</option>
              {available_categories.map((category) => (
                <option key={category} value={category}>
                  {category}
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
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${filters.preset === preset
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
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
            />
          </div>
        </div>

        {/* Sorting */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="published_date">Date</option>
            <option value="title">Title</option>
            <option value="impact_rating">Impact Rating</option>
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

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No articles found</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="h-48 overflow-hidden relative">
                <Image
                  src={article.image_url || '/default_article_cover.png'}
                  alt={article.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link
                      href={`/article/${article.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {article.title}
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-gray-600">
                  <span>{moment(article.published_date).format('MMM D, YYYY')}</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {article.feed_profile}
                  </span>
                  {article.impact_rating && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${article.impact_rating >= 8 ? 'bg-red-100 text-red-800' :
                      article.impact_rating >= 6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      Impact: {article.impact_rating}/10
                    </span>
                  )}
                  {article.categories && article.categories.length > 0 && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-cyan-200 text-cyan-800`}>
                      Categories: {article.categories.join(', ')}
                    </span>
                  )}
                </div>

                {article.processed_content && (
                  <div className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {article.processed_content}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/article/${article.id}`}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Read More</span>
                    </Link>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="hidden sm:inline">Original</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => deleteArticle(article.id)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm border rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                  <BookmarkButton articleId={article.id} size="sm" />
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
              onClick={() => updateFilter('page', Number(pagination.page) - 1)}
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
              onClick={() => updateFilter('page', Number(pagination.page) + 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      )}

      {/* Add Article Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-20 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Article</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="link"
                      checked={uploadMode === 'link'}
                      onChange={(e) => setUploadMode(e.target.value as 'link' | 'upload')}
                      className="mr-2"
                      disabled={addArticleMutation.isPending || uploadMarkdownMutation.isPending || isUploading}
                    />
                    <span className="text-gray-700">Link</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="upload"
                      checked={uploadMode === 'upload'}
                      onChange={(e) => setUploadMode(e.target.value as 'link' | 'upload')}
                      className="mr-2"
                      disabled={addArticleMutation.isPending || uploadMarkdownMutation.isPending || isUploading}
                    />
                    <span className="text-gray-700">Upload</span>
                  </label>
                </div>
              </div>

              {uploadMode === 'link' ? (
                <div>
                  <label htmlFor="article-url" className="block text-sm font-medium text-gray-700 mb-2">
                    Article URL
                  </label>
                  <input
                    id="article-url"
                    type="url"
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500  text-gray-700"
                    disabled={addArticleMutation.isPending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddArticle();
                      }
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="markdown-file" className="block text-sm font-medium text-gray-700 mb-2">
                    Markdown File
                  </label>
                  <input
                    id="markdown-file"
                    type="file"
                    accept=".md,.markdown"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={uploadMarkdownMutation.isPending || isUploading}
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="feed-profile" className="block text-sm font-medium text-gray-700 mb-2">
                  Feed Profile
                </label>
                <select
                  id="feed-profile"
                  value={articleFeedProfile}
                  onChange={(e) => setArticleFeedProfile(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 [&:has(option:checked:not([value='']))]:text-gray-900"
                  disabled={addArticleMutation.isPending || uploadMarkdownMutation.isPending || isUploading}
                >
                  <option value="">Select a profile</option>
                  {available_profiles.map((profile) => (
                    <option key={profile} value={profile}>
                      {profile}
                    </option>
                  ))}
                </select>
              </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={addArticleMutation.isPending || uploadMarkdownMutation.isPending || isUploading}
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddArticle}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={addArticleMutation.isPending || uploadMarkdownMutation.isPending || isUploading}
                  >
                    {(addArticleMutation.isPending || uploadMarkdownMutation.isPending || isUploading) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{uploadMode === 'upload' ? 'Uploading...' : 'Adding...'}</span>
                      </>
                    ) : (
                      <span>{uploadMode === 'upload' ? 'Upload Article' : 'Add Article'}</span>
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

export default function ArticlesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ArticlesContent />
    </Suspense>
  );
}
