import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ArticleDetailPage from './ArticleDetailPage';

const mockGenerateAudio = vi.fn();
let mockArticleData: { article: { id: string; title: string; audio?: { presigned_url: string } | null } };

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: () => ({ id: 'art-1' }),
  };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}));

vi.mock('@/hooks/useApi', () => ({
  useArticle: () => ({
    data: mockArticleData,
    isLoading: false,
  }),
  useBookmarkCheck: () => ({ data: { bookmarked: false } }),
  useToggleBookmark: () => ({
    add: { mutate: vi.fn() },
    remove: { mutate: vi.fn() },
  }),
  useArticles: () => ({ data: { articles: [] } }),
}));

vi.mock('@/hooks/useAudioGeneration', () => ({
  useAudioGeneration: () => ({
    generateAudio: mockGenerateAudio,
    isGenerating: false,
  }),
}));

function renderWithProviders() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/articles/art-1']}>
        <ArticleDetailPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ArticleDetailPage audio section (AC3, AC5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockArticleData = {
      article: {
        id: 'art-1',
        title: 'Test Article',
        url: 'https://example.com',
        published_date: '2024-01-01',
        feed_source: 'Test',
        feed_profile: 'default',
        summary: 'Summary',
        processed_content_html: '<p>Content</p>',
        content_html: '<p>Content</p>',
        impact_rating: 1,
        image_url: null,
        categories: [],
        audio: null,
      },
    };
  });

  it('shows Generate Audio button when no audio exists (AC3)', () => {
    renderWithProviders();
    expect(screen.getByRole('button', { name: /generate audio/i })).toBeInTheDocument();
    expect(screen.queryByText(/listen to article/i)).not.toBeInTheDocument();
  });

  it('shows audio player with playable URL when audio exists (AC3, AC5)', () => {
    mockArticleData.article.audio = {
      id: 'a1',
      presigned_url: 'https://example.com/audio.mp3',
      duration: 120,
    };
    const { container } = renderWithProviders();
    expect(screen.getByText(/listen to article/i)).toBeInTheDocument();
    const audioEl = container.querySelector('audio');
    expect(audioEl).toBeInTheDocument();
    expect(audioEl).toHaveAttribute('src', 'https://example.com/audio.mp3');
    expect(screen.queryByRole('button', { name: /generate audio/i })).not.toBeInTheDocument();
  });
});
