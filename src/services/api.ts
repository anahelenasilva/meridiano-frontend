import axios from 'axios';

// Use /api which will be proxied by Next.js rewrites to the backend
const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
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

  addYoutubeTranscription: (url: string, channelId: string) =>
    api.post('/youtube/transcriptions', { url, channelId }),
};

