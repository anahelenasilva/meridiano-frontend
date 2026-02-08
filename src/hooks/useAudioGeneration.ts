'use client';

import { MESSAGES } from '@/src/constants/messages';
import { apiService } from '@/src/services/api';
import type { AudioJobStatusResponse, GenerateAudioResponse } from '@/src/types/api';
import { toast } from '@/src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

type JobState = 'idle' | 'queuing' | 'polling' | 'completed' | 'failed';

interface UseAudioGenerationReturn {
  generateAudio: () => Promise<void>;
  isGenerating: boolean;
  jobState: JobState;
  progress: number;
  error: string | null;
  reset: () => void;
}

interface UseAudioGenerationOptions {
  articleId: string;
  pollingInterval?: number;
  maxAttempts?: number;
  maxConsecutiveErrors?: number;
}

/**
 * Hook for managing audio generation for an article.
 * Handles triggering the generation job and polling for status updates.
 */
export function useAudioGeneration({
  articleId,
  pollingInterval = 3000,
  maxAttempts = 60,
  maxConsecutiveErrors = 3,
}: UseAudioGenerationOptions): UseAudioGenerationReturn {
  const queryClient = useQueryClient();
  const [jobState, setJobState] = useState<JobState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);
  const consecutiveErrorsRef = useRef(0);

  const isGenerating = jobState === 'queuing' || jobState === 'polling';

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Polling effect
  useEffect(() => {
    if (jobState !== 'polling' || !jobId) {
      return;
    }

    const pollStatus = async () => {
      try {
        attemptsRef.current += 1;

        if (attemptsRef.current > maxAttempts) {
          setJobState('failed');
          setError('Audio generation timed out. Please try again.');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        const response = await apiService.getAudioJobStatus(articleId, jobId);
        const statusData: AudioJobStatusResponse = response.data;

        consecutiveErrorsRef.current = 0;

        setProgress(statusData.progress);

        if (statusData.state === 'completed') {
          setJobState('completed');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          toast.success('Audio generated successfully!');
          queryClient.invalidateQueries({ queryKey: ['article', articleId] });
        } else if (statusData.state === 'failed') {
          setJobState('failed');
          setError(statusData.error || MESSAGES.ERROR.AUDIO_GENERATION_FAILED);

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        consecutiveErrorsRef.current += 1;
        console.error(MESSAGES.ERROR.AUDIO_STATUS_CHECK, err);

        if (consecutiveErrorsRef.current >= maxConsecutiveErrors) {
          setJobState('failed');
          setError('Lost connection to server. Please try again.');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    };

    intervalRef.current = setInterval(pollStatus, pollingInterval);

    void pollStatus();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobState, jobId, articleId, pollingInterval, maxAttempts, maxConsecutiveErrors, queryClient]);

  const generateAudio = useCallback(async () => {
    if (isGenerating) {
      return;
    }

    setJobState('queuing');
    setError(null);
    setProgress(0);
    attemptsRef.current = 0;
    consecutiveErrorsRef.current = 0;

    try {
      const response = await apiService.generateArticleAudio(articleId);
      const data: GenerateAudioResponse = response.data;

      setJobId(data.jobId);
      setJobState('polling');
      toast.success(MESSAGES.SUCCESS.AUDIO_GENERATION_QUEUED);
    } catch (err) {
      setJobState('failed');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`${MESSAGES.ERROR.AUDIO_GENERATION} ${errorMessage}`);
      toast.error(`${MESSAGES.ERROR.AUDIO_GENERATION} ${errorMessage}`);
    }
  }, [articleId, isGenerating]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setJobState('idle');
    setProgress(0);
    setError(null);
    setJobId(null);
    attemptsRef.current = 0;
    consecutiveErrorsRef.current = 0;
  }, []);

  return {
    generateAudio,
    isGenerating,
    jobState,
    progress,
    error,
    reset,
  };
}
