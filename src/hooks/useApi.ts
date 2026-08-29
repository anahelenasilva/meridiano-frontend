import {
  addBookmark,
  checkBookmark,
  createArticleByLink,
  createCategory,
  createChannel,
  createCustomBriefing,
  createTranscriptions,
  deleteArticle,
  deleteCategory,
  deleteTranscription,
  dismissTranscriptionJob,
  fetchArticle,
  fetchArticles,
  fetchAudioJobs,
  fetchAudioLibrary,
  fetchBookmarks,
  fetchBriefing,
  fetchBriefingJobStatus,
  fetchBriefings,
  fetchCategories,
  fetchChannels,
  fetchFailedTranscriptionJobs,
  fetchProfiles,
  fetchTranscription,
  fetchTranscriptions,
  removeBookmark,
  renameCategory,
  saveNote,
  setChannelCategories,
  updateArticle,
  updateBriefingTitle,
  updateChannelEnabled,
  uploadArticleMarkdown,
} from "@/services/api";
import type {
  ArticleDetailResponse,
  ArticlesQueryParams,
  ArticlesResponse,
  AudioJobsResponse,
  AudioLibraryResponse,
  BookmarksResponse,
  Briefing,
  BriefingsResponse,
  CategoryWithCount,
  Note,
  UpdateArticlePayload,
  YouTubeChannel,
  YouTubeTranscriptionDetailResponse,
  YouTubeTranscriptionsResponse
} from "@/types";
import { useAuth } from "@/contexts/AuthContext";
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

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateArticlePayload }) =>
      updateArticle(id, patch),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["article", id] });
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

// ===== Audio =====

export function useAudioLibrary({
  page = 1,
  perPage = 20,
}: { page?: number; perPage?: number } = {}): UseQueryResult<AudioLibraryResponse> {
  const { user } = useAuth();

  return useQuery<AudioLibraryResponse, Error>({
    queryKey: ["audio-library", page, perPage],
    queryFn: () => fetchAudioLibrary(page, perPage),
    enabled: Boolean(user),
  });
}

export function useAudioJobs(): UseQueryResult<AudioJobsResponse> {
  return useQuery<AudioJobsResponse, Error>({
    queryKey: ["audio-jobs"],
    queryFn: fetchAudioJobs,
    refetchInterval: (query) => (query.state.data?.jobs.length ? 2000 : false),
  });
}

// ===== Bookmarks =====

export function useBookmarks(
  page = 1,
  perPage = 20,
): UseQueryResult<BookmarksResponse> {
  const { user } = useAuth();

  return useQuery<BookmarksResponse, Error>({
    queryKey: ["bookmarks", page, perPage],
    queryFn: () => fetchBookmarks(page, perPage),
    enabled: Boolean(user),
  });
}

export function useBookmarkCheck(
  articleId: string | undefined,
): UseQueryResult<{ bookmarked: boolean }> {
  const { user } = useAuth();

  return useQuery<{ bookmarked: boolean }, Error>({
    queryKey: ["bookmark-check", articleId],
    queryFn: () => {
      return checkBookmark(articleId as string);
    },
    enabled: Boolean(articleId) && Boolean(user),
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: (articleId: string) => {
      return addBookmark(articleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["bookmark-check"] });
    },
  });

  const remove = useMutation({
    mutationFn: (articleId: string) => {
      return removeBookmark(articleId);
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

export function useSetChannelCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { channelId: string; categoryNames: string[] }) =>
      setChannelCategories(input.channelId, input.categoryNames),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-channels"] });
      queryClient.invalidateQueries({ queryKey: ["youtube-transcriptions"] });
    },
  });
}

// ===== YouTube Categories =====

export function useCategories(): UseQueryResult<CategoryWithCount[]> {
  return useQuery<CategoryWithCount[], Error>({
    queryKey: ["youtube-categories"],
    queryFn: fetchCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-categories"] });
    },
  });
}

export function useRenameCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-categories"] });
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

export function useAddTranscriptions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      urls,
      channelId,
      customPrompt,
      generateAudio,
    }: {
      urls: string[];
      channelId: string;
      customPrompt?: string;
      generateAudio?: boolean;
    }) => createTranscriptions(urls, channelId, customPrompt, generateAudio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-transcriptions"] });
      queryClient.invalidateQueries({ queryKey: ["transcription-jobs-failed"] });
    },
  });
}

/**
 * Failures land minutes after a batch is queued, so there is no interval here.
 * Coming back to the tab is the moment worth refetching on.
 */
export function useFailedTranscriptionJobs() {
  return useQuery({
    queryKey: ["transcription-jobs-failed"],
    queryFn: fetchFailedTranscriptionJobs,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}

export function useDismissTranscriptionJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => dismissTranscriptionJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcription-jobs-failed"] });
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

// ===== Notes =====

function replaceNoteById<T extends { id: string; note?: Note | null }>(
  items: T[],
  sourceId: string,
  note: Note | null,
): T[] {
  if (!items.some((item) => item.id === sourceId)) {
    return items;
  }
  return items.map((item) => (item.id === sourceId ? { ...item, note } : item));
}

export function useSaveNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sourceType,
      sourceId,
      content,
    }: {
      sourceType: "article" | "transcription";
      sourceId: string;
      content: string;
    }) => saveNote(sourceType, sourceId, content),
    onSuccess: (data: { note: Note | null }, { sourceType, sourceId }) => {
      if (sourceType === "article") {
        queryClient.setQueriesData<ArticleDetailResponse>(
          { queryKey: ["article", sourceId] },
          (old) => (old ? { ...old, article: { ...old.article, note: data.note } } : old),
        );
        queryClient.setQueriesData<ArticlesResponse>(
          { queryKey: ["articles"] },
          (old) => (old ? { ...old, articles: replaceNoteById(old.articles, sourceId, data.note) } : old),
        );
        queryClient.setQueriesData<BookmarksResponse>(
          { queryKey: ["bookmarks"] },
          (old) => {
            if (!old || !old.bookmarks.some((bookmark) => bookmark.article.id === sourceId)) {
              return old;
            }
            return {
              ...old,
              bookmarks: old.bookmarks.map((bookmark) =>
                bookmark.article.id === sourceId
                  ? { ...bookmark, article: { ...bookmark.article, note: data.note } }
                  : bookmark,
              ),
            };
          },
        );
      } else {
        queryClient.setQueriesData<YouTubeTranscriptionDetailResponse>(
          { queryKey: ["youtube-transcription", sourceId] },
          (old) => (old ? { ...old, transcription: { ...old.transcription, note: data.note } } : old),
        );
        queryClient.setQueriesData<YouTubeTranscriptionsResponse>(
          { queryKey: ["youtube-transcriptions"] },
          (old) =>
            old
              ? { ...old, transcriptions: replaceNoteById(old.transcriptions, sourceId, data.note) }
              : old,
        );
      }
    },
  });
}
