'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { apiService } from '@/src/services/api';
import type { Bookmark as BookmarkType } from '@/src/types/api';
import { toast } from '@/src/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark, BookmarkCheck } from 'lucide-react';

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
    const { userId } = useAuth();
    const queryClient = useQueryClient();

    // Query to check if article is bookmarked (if not provided via props)
    const { data: bookmarkStatus } = useQuery({
        queryKey: ['bookmark-status', userId, articleId],
        queryFn: async () => {
            if (!userId) return false;
            try {
                const response = await apiService.getBookmarks(userId, 1, 100);
                const isBookmarked = response.data.bookmarks.some(
                    (bookmark: BookmarkType) => bookmark.article_id === articleId
                );
                return isBookmarked;
            } catch (error) {
                console.error('Error checking bookmark status:', error);
                toast.error('Failed to check bookmark status');
                return false;
            }
        },
        enabled: !!userId && initialIsBookmarked === undefined,
        staleTime: 30000, // Cache for 30 seconds
    });

    const isBookmarked = initialIsBookmarked ?? bookmarkStatus ?? false;

    // Add bookmark mutation
    const addBookmarkMutation = useMutation({
        mutationFn: () => {
            if (!userId) throw new Error('User not authenticated');
            return apiService.addBookmark(userId, articleId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks', userId] });
            queryClient.invalidateQueries({ queryKey: ['bookmark-status', userId, articleId] });
            toast.success('Article bookmarked');
        },
        onError: (error: Error) => {
            toast.error(`Failed to bookmark article: ${error.message}`);
        },
    });

    // Remove bookmark mutation
    const removeBookmarkMutation = useMutation({
        mutationFn: () => {
            if (!userId) throw new Error('User not authenticated');
            return apiService.removeBookmark(userId, articleId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks', userId] });
            queryClient.invalidateQueries({ queryKey: ['bookmark-status', userId, articleId] });
            toast.success('Bookmark removed');
        },
        onError: (error: Error) => {
            toast.error(`Failed to remove bookmark: ${error.message}`);
        },
    });

    const handleToggleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId) {
            toast.error('Please set a user ID to use bookmarks');
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
