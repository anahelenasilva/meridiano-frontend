import { MESSAGES } from '@/constants/messages';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAudioGeneration } from './useAudioGeneration';

const mockGenerateArticleAudio = vi.fn();
const mockGenerateTranscriptionAudio = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('@/services/api', () => ({
  generateArticleAudio: (id: string) => mockGenerateArticleAudio(id),
  generateTranscriptionAudio: (id: string) => mockGenerateTranscriptionAudio(id),
}));

vi.mock('@/utils/toast', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useAudioGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC1, AC2: success flow (article and transcription)', () => {
    it('shows PRD toast message on successful article audio generation', async () => {
      mockGenerateArticleAudio.mockResolvedValue({ jobId: 'j1', message: 'other' });
      const { result } = renderHook(
        () => useAudioGeneration({ sourceType: 'article', sourceId: 'art-1' }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.generateAudio();
      });
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          MESSAGES.SUCCESS.AUDIO_GENERATION_QUEUED
        );
      });
    });

    it('shows PRD toast message on successful transcription audio generation', async () => {
      mockGenerateTranscriptionAudio.mockResolvedValue({ jobId: 'j2', message: 'other' });
      const { result } = renderHook(
        () => useAudioGeneration({ sourceType: 'transcription', sourceId: 'tr-1' }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.generateAudio();
      });
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          MESSAGES.SUCCESS.AUDIO_GENERATION_QUEUED
        );
      });
    });

    it('sets isGenerating true during request and false after', async () => {
      let resolveRequest!: () => void;
      const requestPromise = new Promise<{ jobId: string; message: string }>((r) => {
        resolveRequest = () => r({ jobId: 'j1', message: 'ok' });
      });
      mockGenerateArticleAudio.mockReturnValue(requestPromise);
      const { result } = renderHook(
        () => useAudioGeneration({ sourceType: 'article', sourceId: 'art-1' }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isGenerating).toBe(false);
      await act(async () => {
        result.current.generateAudio();
      });
      await waitFor(() => expect(result.current.isGenerating).toBe(true));
      resolveRequest();
      await waitFor(() => expect(result.current.isGenerating).toBe(false));
    });

    it('invalidates article query on success', async () => {
      mockGenerateArticleAudio.mockResolvedValue({ jobId: 'j1', message: 'ok' });
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      const { result } = renderHook(
        () => useAudioGeneration({ sourceType: 'article', sourceId: 'art-1' }),
        { wrapper: Wrapper }
      );

      await act(async () => {
        result.current.generateAudio();
      });
      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['article', 'art-1'] });
      });
    });

    it('invalidates transcription query on success', async () => {
      mockGenerateTranscriptionAudio.mockResolvedValue({ jobId: 'j2', message: 'ok' });
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      const { result } = renderHook(
        () => useAudioGeneration({ sourceType: 'transcription', sourceId: 'tr-1' }),
        { wrapper: Wrapper }
      );

      await act(async () => {
        result.current.generateAudio();
      });
      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['youtube-transcription', 'tr-1'],
        });
      });
    });
  });

  describe('AC4: 409 Conflict and error handling', () => {
    it('shows error toast and returns button to idle on API error', async () => {
      const apiError = new Error('Conflict with existing resource');
      Object.assign(apiError, { status: 409 });
      mockGenerateArticleAudio.mockRejectedValue(apiError);
      const { result } = renderHook(
        () => useAudioGeneration({ sourceType: 'article', sourceId: 'art-1' }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.generateAudio();
      });
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
        expect(result.current.isGenerating).toBe(false);
      });
    });

    it('does not call toast.success when API throws', async () => {
      mockGenerateArticleAudio.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(
        () => useAudioGeneration({ sourceType: 'article', sourceId: 'art-1' }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.generateAudio();
      });
      await waitFor(() => expect(mockToastError).toHaveBeenCalled());
      expect(mockToastSuccess).not.toHaveBeenCalled();
    });
  });

  describe('guards', () => {
    it('does nothing when sourceId is undefined', async () => {
      const { result } = renderHook(
        () => useAudioGeneration({ sourceType: 'article', sourceId: undefined }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.generateAudio();
      });
      await waitFor(() => {});
      expect(mockGenerateArticleAudio).not.toHaveBeenCalled();
      expect(mockToastSuccess).not.toHaveBeenCalled();
    });
  });
});
