import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ArticleDetailResponse } from '@/types';
import ArticleDetailPage from './ArticleDetailPage';

const mockGenerateAudio = vi.fn();
let mockArticleData: ArticleDetailResponse;
let mockBookmarked = false;

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useParams: () => ({ id: 'art-1' }),
  };
});

vi.mock('@/hooks/useApi', () => ({
  useArticle: () => ({
    data: mockArticleData,
    isLoading: false,
  }),
  useBookmarkCheck: () => ({ data: { bookmarked: mockBookmarked } }),
  useToggleBookmark: () => ({
    add: { mutate: vi.fn() },
    remove: { mutate: vi.fn() },
  }),
  useArticles: () => ({ data: { articles: [] } }),
  useSaveNote: () => ({ mutate: vi.fn(), isPending: false }),
  useArchiveArticle: () => ({ mutate: vi.fn(), isPending: false }),
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
        has_audio: false,
        archived_at: null,
        is_bookmarked: false,
        note: {
          id: 'n1',
          content: 'Existing note',
          created_at: '2024-01-01',
          updated_at: '2024-01-02',
        },
      },
    };
  });

  it('shows Generate Audio button and retry hint when no audio exists (AC3)', () => {
    renderWithProviders();
    expect(screen.getByRole('button', { name: /generate audio/i })).toBeInTheDocument();
    expect(screen.getByText(/no audio available.*generate or retry/i)).toBeInTheDocument();
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

  it('renders the note editor with the current article note', () => {
    renderWithProviders();
    expect(screen.getByRole('heading', { name: /note/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing note')).toBeInTheDocument();
  });

  it('hides the AI Summary until the article is processed', () => {
    mockArticleData.article.processed_content_html = null;
    renderWithProviders();
    expect(screen.queryByRole('heading', { name: /ai summary/i })).not.toBeInTheDocument();
  });
});

describe('ArticleDetailPage cover and bookmark icon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBookmarked = false;
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
        has_audio: false,
        archived_at: null,
        is_bookmarked: false,
      },
    };
  });

  it('renders no image for an article with no image_url', () => {
    const { container } = renderWithProviders();
    expect(container.querySelector('img')).toBeNull();
  });

  it("renders the article's own image when it has one", () => {
    mockArticleData.article.image_url = 'https://example.com/cover.png';
    const { container } = renderWithProviders();
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/cover.png'
    );
  });

  // Matches the card, which has always shown BookmarkCheck for a bookmark.
  it('shows BookmarkCheck in primary for a bookmarked article', () => {
    mockBookmarked = true;
    const { container } = renderWithProviders();
    expect(container.querySelector('.lucide-bookmark-check.text-primary')).not.toBeNull();
  });

  it('shows a plain Bookmark for an article that is not bookmarked', () => {
    const { container } = renderWithProviders();
    expect(container.querySelector('.lucide-bookmark-check')).toBeNull();
    expect(container.querySelector('.lucide-bookmark')).not.toBeNull();
  });
});
