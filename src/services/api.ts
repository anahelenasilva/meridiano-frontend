import {
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
import { parseErrorResponse } from "@/utils/api-error";

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("auth_token");
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export const getApiBaseUrl = (): string => {
  console.log('getApiBaseUrl envs', {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    typeofWindow: typeof window,
  });

  if (import.meta.env.MODE === 'development') {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  }

  //not the best solution, but it works for now; will improve later
  if (import.meta.env.VITE_API_BASE_URL?.includes("railway.app")) {
    return `${import.meta.env.VITE_API_BASE_URL}`
  }

  // If running in browser, use current hostname
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = '3001'; // Your API port
    return `${protocol}//${hostname}:${port}`;
  }

  // Fallback for server-side rendering (SSR)
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
}

function redirectToLogin(): void {
  clearAuthToken();
  try {
    localStorage.removeItem("meridiano_user");
  } catch {
    // ignore
  }
  const redirect = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/login?redirect=${redirect}`;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && token) {
    redirectToLogin();
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const body = await res.text();
    throw parseErrorResponse(res.status, res.statusText, body);
  }

  return res.json();
}

function toQuery(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

// ===== Auth =====
export async function login(email: string, password: string) {
  return apiFetch<{ access_token: string; user: { id: string; email: string; username: string } }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ===== Profiles =====
export async function fetchProfiles() {
  return apiFetch<string[]>("/api/profiles");
}

// ===== Articles =====
export async function fetchArticles(params: ArticlesQueryParams = {}) {
  return apiFetch<ArticlesResponse>(`/api/articles${toQuery(params as Record<string, unknown>)}`);
}

export async function fetchArticle(id: string, includeAudio = true) {
  return apiFetch<ArticleDetailResponse>(`/api/articles/${id}?includeAudio=${includeAudio}`);
}

export async function deleteArticle(id: string) {
  return apiFetch<{ success: boolean }>(`/api/articles/${id}`, { method: "DELETE" });
}

export async function createArticleByLink(url: string, feedProfile?: string) {
  return apiFetch<{ id: string }>("/api/articles", {
    method: "POST",
    body: JSON.stringify({ url, feedProfile }),
  });
}

export async function uploadArticleMarkdown(file: File, feedProfile?: string) {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("file", file);
  if (feedProfile) formData.append("feedProfile", feedProfile);

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${getApiBaseUrl()}/api/articles/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (res.status === 401 && token) {
    redirectToLogin();
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const body = await res.text();
    throw parseErrorResponse(res.status, res.statusText, body);
  }

  return res.json() as Promise<{ id: string }>;
}

// ===== Bookmarks =====

export async function fetchBookmarks(userId: string, page = 1, perPage = 20) {
  return apiFetch<BookmarksResponse>(`/api/bookmarks${toQuery({ user_id: userId, page, per_page: perPage })}`);
}

export async function addBookmark(userId: string, articleId: string) {
  console.log("addBookmark", userId, articleId);
  return apiFetch<{ id: string }>("/api/bookmarks", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, article_id: articleId }),
  });
}

export async function removeBookmark(userId: string, articleId: string) {
  return apiFetch<{ success: boolean }>(`/api/bookmarks${toQuery({ user_id: userId, article_id: articleId })}`, {
    method: "DELETE",
  });
}

export async function checkBookmark(articleId: string, userId: string) {
  return apiFetch<{ bookmarked: boolean }>(`/api/bookmarks/check/${articleId}${toQuery({ user_id: userId })}`);
}

// ===== Briefings =====


export async function fetchBriefings(feedProfile?: string) {
  return apiFetch<BriefingsResponse>(`/api/briefings${toQuery({ feedProfile: feedProfile || "" })}`);
}

export async function fetchBriefing(id: string) {
  return apiFetch<Briefing>(`/api/briefings/${id}`);
}

// ===== YouTube Channels =====
export async function fetchChannels() {
  return apiFetch<YouTubeChannel[]>("/api/youtube/channels");
}

export async function createChannel(data: { channelId: string; name: string; url: string; description?: string; enabled?: boolean; maxVideos?: number }) {
  return apiFetch<YouTubeChannel>("/api/youtube/channels", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateChannelEnabled(channelId: string, enabled: boolean) {
  return apiFetch<{ success: boolean }>(`/api/youtube/channels/${channelId}`, {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
}

// ===== YouTube Transcriptions =====

export async function fetchTranscriptions() {
  return apiFetch<YouTubeTranscriptionsResponse>("/api/youtube/transcriptions");
}

export async function fetchTranscription(id: string) {
  return apiFetch<YouTubeTranscriptionDetailResponse>(`/api/youtube/transcriptions/${id}`);
}

export async function createTranscription(url: string, channelId?: string) {
  return apiFetch<{ jobId: string; message: string }>("/api/youtube/transcriptions", {
    method: "POST",
    body: JSON.stringify({ url, channelId }),
  });
}

export async function deleteTranscription(id: string) {
  return apiFetch<{ success: boolean }>(`/api/youtube/transcriptions/${id}`, { method: "DELETE" });
}
