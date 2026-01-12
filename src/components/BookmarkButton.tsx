'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { apiService } from '@/src/services/api';
import { toast } from '@/src/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { MESSAGES } from '../constants/messages';

interface BookmarkButtonProps {
  articleId: string;
  isBookmarked?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function BookmarkButton({
  articleId,
  isBookmarked: initialIsBookmarked,
  showLabel = false,
  size = 'md'
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { data: bookmarkStatus } = useQuery<boolean>({
    queryKey: ['bookmark-status', userId, articleId],
    queryFn: async (): Promise<boolean> => {
      if (!userId) {
        return false;
      }

      try {
        const response = await apiService.checkBookmark(userId, articleId);
        return Boolean(response.data?.bookmarked);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
        return false;
      }
    },
    enabled: !!userId && initialIsBookmarked === undefined,
    staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnMount: false, // Don't refetch when component remounts if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
    // Provide a placeholder value to prevent undefined errors
    placeholderData: false,
  });

  const isBookmarked = initialIsBookmarked ?? bookmarkStatus ?? false;

  const addBookmarkMutation = useMutation({
    mutationFn: () => {
      if (!userId) {
        throw new Error(MESSAGES.ERROR.LOGIN_REQUIRED);
      }

      return apiService.addBookmark(userId, articleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', userId] });
      queryClient.invalidateQueries({ queryKey: ['bookmark-status', userId, articleId] });
      toast.success(MESSAGES.SUCCESS.ARTICLE_BOOKMARKED);
    },
    onError: (error: Error) => {
      toast.error(`${MESSAGES.ERROR.ARTICLE_BOOKMARK} ${error.message}`);
    },
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: () => {
      if (!userId) {
        throw new Error(MESSAGES.ERROR.LOGIN_REQUIRED);
      }

      return apiService.removeBookmark(userId, articleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', userId] });
      queryClient.invalidateQueries({ queryKey: ['bookmark-status', userId, articleId] });
      toast.success(MESSAGES.SUCCESS.ARTICLE_UNBOOKMARKED);
    },
    onError: (error: Error) => {
      toast.error(`${MESSAGES.ERROR.ARTICLE_UNBOOKMARK} ${error.message}`);
    },
  });

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error(MESSAGES.ERROR.LOGIN_REQUIRED);
      return;
    }

    if (isBookmarked) {
      removeBookmarkMutation.mutate();
    } else {
      addBookmarkMutation.mutate();
    }
  };

  const isLoading = addBookmarkMutation.isPending || removeBookmarkMutation.isPending;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  return (
    <button
      type="button"
      onClick={handleToggleBookmark}
      disabled={isLoading || !userId}
      className={`flex items-center space-x-1 ${buttonSizeClasses[size]} border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isBookmarked
        ? 'bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-600'
        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
        }`}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {isLoading ? (
        <div className={`animate-spin rounded-full border-b-2 ${isBookmarked ? 'border-white' : 'border-gray-700'} ${sizeClasses[size]}`}></div>
      ) : isBookmarked ? (
        <BookmarkCheck className={sizeClasses[size]} />
      ) : (
        <Bookmark className={sizeClasses[size]} />
      )}
      {showLabel && <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>}
    </button>
  );
}
