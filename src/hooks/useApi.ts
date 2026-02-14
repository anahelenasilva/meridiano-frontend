import {
  addBookmark,
  checkBookmark,
  createArticleByLink,
  createChannel,
  createTranscription,
  deleteArticle,
  deleteTranscription,
  fetchArticle,
  fetchArticles,
  fetchBookmarks,
  fetchBriefing,
  fetchBriefings,
  fetchChannels,
  fetchProfiles,
  fetchTranscription,
  fetchTranscriptions,
  removeBookmark,
  updateChannelEnabled,
  uploadArticleMarkdown,
} from "@/services/api";
import type {
  ArticleDetailResponse,
  ArticlesQueryParams,
  ArticlesResponse,
  BookmarksResponse,
  Briefing,
  BriefingsResponse,
  YouTubeChannel,
  YouTubeTranscriptionDetailResponse,
  YouTubeTranscriptionsResponse
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type UseQueryResult<T> = ReturnType<typeof useQuery<T, Error>>;

// ===== Articles =====

export function useArticles(params: ArticlesQueryParams = {}): UseQueryResult<ArticlesResponse> {
  return useQuery<ArticlesResponse, Error>({
    queryKey: ["articles", params],
    queryFn: () => fetchArticles(params),
  });
}

export function useArticle(id: string | undefined, includeAudio = true): UseQueryResult<ArticleDetailResponse> {
  return useQuery<ArticleDetailResponse, Error>({
    queryKey: ["article", id, includeAudio],
    queryFn: () => fetchArticle(id as string, includeAudio),
    enabled: Boolean(id),
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useCreateArticleByLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, feedProfile }: { url: string; feedProfile?: string }) =>
      createArticleByLink(url, feedProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useUploadArticleMarkdown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, feedProfile }: { file: File; feedProfile?: string }) =>
      uploadArticleMarkdown(file, feedProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useProfiles() {
  return useQuery<string[], Error>({
    queryKey: ["profiles"],
    queryFn: fetchProfiles,
  });
}

// ===== Bookmarks =====

export function useBookmarks(
  userId: string | undefined,
  page = 1,
  perPage = 20,
): UseQueryResult<BookmarksResponse> {
  return useQuery<BookmarksResponse, Error>({
    queryKey: ["bookmarks", userId, page, perPage],
    queryFn: () => fetchBookmarks(userId as string, page, perPage),
    enabled: Boolean(userId),
  });
}

export function useBookmarkCheck(
  articleId: string | undefined,
  userId: string | undefined,
): UseQueryResult<{ bookmarked: boolean }> {
  return useQuery<{ bookmarked: boolean }, Error>({
    queryKey: ["bookmark-check", articleId, userId],
    queryFn: () => {
      return checkBookmark(articleId as string, userId as string);
    },
    enabled: Boolean(articleId) && Boolean(userId),
  });
}

export function useToggleBookmark(userId: string | undefined) {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: (articleId: string) => {
      return addBookmark(userId as string, articleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["bookmark-check"] });
    },
  });

  const remove = useMutation({
    mutationFn: (articleId: string) => {
      return removeBookmark(userId as string, articleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["bookmark-check"] });
    },
  });

  return { add, remove };
}

// ===== Briefings =====

export function useBriefings(feedProfile?: string): UseQueryResult<BriefingsResponse> {
  return useQuery<BriefingsResponse, Error>({
    queryKey: ["briefings", feedProfile ?? null],
    queryFn: () => fetchBriefings(feedProfile),
  });
}

export function useBriefing(id: string | undefined): UseQueryResult<Briefing> {
  return useQuery<Briefing, Error>({
    queryKey: ["briefing", id],
    queryFn: () => fetchBriefing(id as string),
    enabled: Boolean(id),
  });
}

// ===== YouTube Channels =====

export function useChannels(): UseQueryResult<YouTubeChannel[]> {
  return useQuery<YouTubeChannel[], Error>({
    queryKey: ["youtube-channels"],
    queryFn: fetchChannels,
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-channels"] });
    },
  });
}

export function useToggleChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { channelId: string; enabled: boolean }) =>
      updateChannelEnabled(input.channelId, input.enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-channels"] });
    },
  });
}

// ===== YouTube Transcriptions =====

export function useTranscriptions(): UseQueryResult<YouTubeTranscriptionsResponse> {
  return useQuery<YouTubeTranscriptionsResponse, Error>({
    queryKey: ["youtube-transcriptions"],
    queryFn: fetchTranscriptions,
  });
}

export function useTranscription(
  id: string | undefined,
): UseQueryResult<YouTubeTranscriptionDetailResponse> {
  return useQuery<YouTubeTranscriptionDetailResponse, Error>({
    queryKey: ["youtube-transcription", id],
    queryFn: () => fetchTranscription(id as string),
    enabled: Boolean(id),
  });
}

export function useAddTranscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, channelId }: { url: string; channelId?: string }) =>
      createTranscription(url, channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-transcriptions"] });
    },
  });
}

export function useDeleteTranscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTranscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-transcriptions"] });
    },
  });
}

