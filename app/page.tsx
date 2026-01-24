'use client';

import { useQuery } from '@tanstack/react-query';
import { Bookmark as BookmarkIcon, Calendar, ExternalLink, Eye } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { Suspense, useCallback, useState } from 'react';

import BookmarkButton from '@/src/components/BookmarkButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { apiService } from '@/src/services/api';
import type { BookmarksResponse } from '@/src/types/api';

function BookmarksContent() {
  const { user } = useAuth();
  const userId = user?.id;
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading, error } = useQuery<BookmarksResponse>({
    queryKey: ['bookmarks', userId, page],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await apiService.getBookmarks(userId, page, perPage);
      return response.data;
    },
    enabled: !!userId,
  });

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!userId) {
    return (
      <div className="text-center py-12">
        <BookmarkIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Not Authenticated</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please log in to view your bookmarks.
        </p>
      </div>
    );
  }

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
        <div className="text-red-600 dark:text-red-400 text-lg mb-4">Error loading bookmarks</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const { bookmarks, total, totalPages } = data || {
    bookmarks: [],
    total: 0,
    page: 1,
    perPage: 20,
    totalPages: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            <BookmarkIcon className="inline-block h-6 w-6 sm:h-8 sm:w-8 mr-2 text-yellow-600 dark:text-yellow-500" />
            My Bookmarks
          </h1>
          {total > 0 && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {total} bookmarked {total === 1 ? 'article' : 'articles'}
            </p>
          )}
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <BookmarkIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No bookmarks yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start bookmarking articles to read them later!
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Browse Articles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookmarks.map((bookmark) => {
            const article = bookmark.article;
            return (
              <div
                key={bookmark.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* <div className="h-48 overflow-hidden relative">
                  <Image
                    src={article.image_url || '/default_article_cover.png'}
                    alt={article.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div> */}

                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link
                        href={`/article/${article.id}`}
                        className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                      >
                        {article.title}
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                    <span>{moment(article.published_date).format('MMM D, YYYY')}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                      {article.feed_profile}
                    </span>
                    {article.impact_rating && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${article.impact_rating >= 8 ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' :
                        article.impact_rating >= 6 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                        Impact: {article.impact_rating}/10
                      </span>
                    )}

                    {article.categories && article.categories.length > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-cyan-200 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300">
                        {article.categories.join(', ')}
                      </span>
                    )}
                  </div>

                  {/* {article.processed_content && (
                    <div className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {article.processed_content}
                    </div>
                  )} */}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/article/${article.id}`}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Read</span>
                      </Link>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="hidden sm:inline">Original</span>
                      </a>
                    </div>
                    <BookmarkButton articleId={article.id} isBookmarked={true} size="sm" />
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Bookmarked {moment(bookmark.created_at).fromNow()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          {page > 1 && (
            <button
              onClick={() => handlePageChange(page - 1)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
          )}

          <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
            Page {page} of {totalPages}
          </span>

          {page < totalPages && (
            <button
              onClick={() => handlePageChange(page + 1)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    }>
      <BookmarksContent />
    </Suspense>
  );
}
