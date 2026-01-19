import axios from 'axios';

/**
 * Get the API base URL dynamically based on the current hostname
 * This works for:
 * - Tailscale access
 * - Local network
 * - Localhost
 */
export const getApiBaseUrl = (): string => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  }

  // If running in browser, use current hostname
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = '3001'; // Your API port
    return `${protocol}//${hostname}:${port}`;
  }

  // Fallback for server-side rendering (SSR)
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
};

const API_BASE_URL = 'api';

export const api = axios.create({
  baseURL: `${getApiBaseUrl()}/${API_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.url?.includes('/auth/login')) {
      return config;
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('meridiano_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('meridiano_access_token');
        localStorage.removeItem('meridiano_user');

        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  getBriefings: (feedProfile?: string) =>
    api.get(`/briefings${feedProfile ? `?feed_profile=${feedProfile}` : ''}`),

  getBriefing: (id: string) =>
    api.get(`/briefings/${id}`),

  getArticles: (params?: {
    page?: number;
    sort_by?: string;
    direction?: 'asc' | 'desc';
    feed_profile?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
    preset?: string;
    category?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }
    return api.get(`/articles?${searchParams.toString()}`);
  },

  getArticle: (id: string) =>
    api.get(`/articles/${id}`),

  deleteArticle: (id: string) =>
    api.delete(`/articles/${id}`),

  addArticle: (url: string, feedProfile: string) =>
    api.post('/articles', { url, feedProfile }),

  getPresignedUrl: (fileName: string) =>
    api.post('/articles/upload-url', { articleFileName: fileName, contentType: 'text/markdown' }),

  addArticleFromMarkdown: (s3Key: string, feedProfile: string) =>
    api.post('/articles/markdown', { s3Key, feedProfile }),

  getProfiles: () =>
    api.get('/profiles'),

  getHealth: () =>
    api.get('/health'),

  getYoutubeTranscriptions: () => {
    return api.get(`/youtube/transcriptions`);
  },

  getYoutubeTranscription: (id: string) =>
    api.get(`/youtube/transcriptions/${id}`),

  deleteYoutubeTranscription: (id: string) =>
    api.delete(`/youtube/transcriptions/${id}`),

  getYoutubeChannels: () =>
    api.get('/youtube/channels'),

  createYoutubeChannel: (data: {
    channelId: string;
    name: string;
    url: string;
    description: string;
    enabled: boolean;
    maxVideos?: number;
  }) => api.post('/youtube/channels', data),

  updateChannelEnabled: (channelId: string, enabled: boolean) =>
    api.patch(`/youtube/channels/${channelId}`, { enabled }),

  addYoutubeTranscription: (url: string, channelId: string) =>
    api.post('/youtube/transcriptions', { url, channelId }),

  addBookmark: (userId: string, articleId: string) =>
    api.post('/bookmarks', { user_id: userId, article_id: articleId }),

  getBookmarks: (userId: string, page: number = 1, perPage: number = 20) =>
    api.get(`/bookmarks?user_id=${userId}&page=${page}&per_page=${perPage}`),

  checkBookmark: (userId: string, articleId: string) =>
    api.get(`/bookmarks/check/${articleId}?user_id=${userId}`),

  removeBookmark: (userId: string, articleId: string) =>
    api.delete(`/bookmarks?user_id=${userId}&article_id=${articleId}`),
};
