import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import YoutubeTranscriptionDetailPage from './YoutubeTranscriptionDetailPage';

const mockGenerateAudio = vi.fn();
let mockTranscriptionData: {
  transcription: { id: string; videoTitle: string; videoUrl: string; channelName: string; transcriptionText: string; postedAt: string; createdAt: string };
  audio?: { presigned_url: string } | null;
};

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: () => ({ id: 'tr-1' }),
  };
});

vi.mock('@/hooks/useApi', () => ({
  useTranscription: () => ({
    data: mockTranscriptionData,
    isLoading: false,
  }),
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
      <MemoryRouter initialEntries={['/youtube-transcriptions/tr-1']}>
        <YoutubeTranscriptionDetailPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('YoutubeTranscriptionDetailPage audio section (AC3, AC5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTranscriptionData = {
      transcription: {
        id: 'tr-1',
        videoId: 'v1',
        videoTitle: 'Test Video',
        videoUrl: 'https://youtube.com/watch?v=v1',
        channelName: 'Test Channel',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        transcriptionText: 'Transcript text',
        postedAt: '2024-01-01',
        createdAt: '2024-01-01',
      },
      audio: undefined,
    };
  });

  it('shows Generate Audio button when no audio exists (AC3)', () => {
    renderWithProviders();
    expect(screen.getByRole('button', { name: /generate audio/i })).toBeInTheDocument();
    expect(screen.queryByText(/listen to transcription/i)).not.toBeInTheDocument();
  });

  it('shows audio player with playable URL when audio exists (AC3, AC5)', () => {
    mockTranscriptionData.audio = {
      id: 'a1',
      s3_key: 'key',
      file_size_bytes: 1000,
      presigned_url: 'https://example.com/transcription-audio.mp3',
    };
    const { container } = renderWithProviders();
    expect(screen.getByText(/listen to transcription/i)).toBeInTheDocument();
    const audioEl = container.querySelector('audio');
    expect(audioEl).toBeInTheDocument();
    expect(audioEl).toHaveAttribute('src', 'https://example.com/transcription-audio.mp3');
    expect(screen.queryByRole('button', { name: /generate audio/i })).not.toBeInTheDocument();
  });
});
