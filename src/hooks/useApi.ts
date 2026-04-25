import {
  addBookmark,
  checkBookmark,
  createArticleByLink,
  createChannel,
  createCustomBriefing,
  createTranscription,
  deleteArticle,
  deleteTranscription,
  fetchArticle,
  fetchArticles,
  fetchBookmarks,
  fetchBriefing,
  fetchBriefingJobStatus,
  fetchBriefings,
  fetchChannels,
  fetchProfiles,
  fetchTranscription,
  fetchTranscriptions,
  removeBookmark,
  updateBriefingTitle,
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
    mutationFn: ({
      url,
      feedProfile,
      customPrompt,
      generateAudio,
    }: {
      url: string;
      feedProfile?: string;
      customPrompt?: string;
      generateAudio?: boolean;
    }) => createArticleByLink(url, feedProfile, customPrompt, generateAudio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useUploadArticleMarkdown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      feedProfile,
      customPrompt,
      generateAudio,
    }: {
      file: File;
      feedProfile?: string;
      customPrompt?: string;
      generateAudio?: boolean;
    }) => uploadArticleMarkdown(file, feedProfile, customPrompt, generateAudio),
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
    mutationFn: ({
      url,
      channelId,
      customPrompt,
      generateAudio,
    }: {
      url: string;
      channelId?: string;
      customPrompt?: string;
      generateAudio?: boolean;
    }) => createTranscription(url, channelId, customPrompt, generateAudio),
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

// ===== Custom Briefings =====

export function useCreateCustomBriefing() {
  return useMutation({
    mutationFn: ({
      articleIds,
      feedProfile,
      customPrompt,
    }: {
      articleIds: string[];
      feedProfile: string;
      customPrompt?: string;
    }) => createCustomBriefing(articleIds, feedProfile, customPrompt),
  });
}

export function useBriefingJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["briefing-job", jobId],
    queryFn: () => fetchBriefingJobStatus(jobId as string),
    enabled: Boolean(jobId),
    refetchInterval: 2000,
  });
}

export function useUpdateBriefingTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, customTitle }: { id: string; customTitle: string }) =>
      updateBriefingTitle(id, customTitle),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["briefing", id] });
      queryClient.invalidateQueries({ queryKey: ["briefings"] });
    },
  });
}

