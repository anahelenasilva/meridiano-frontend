'use client';

import { MESSAGES } from '@/constants/messages';
import {
  generateArticleAudio,
  generateTranscriptionAudio,
} from '@/services/api';
import { getErrorMessage } from '@/utils/api-error';
import { toast } from '@/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

type SourceType = 'article' | 'transcription';

interface UseAudioGenerationOptions {
  sourceType: SourceType;
  sourceId: string | undefined;
}

interface UseAudioGenerationReturn {
  generateAudio: () => Promise<void>;
  isGenerating: boolean;
}

export function useAudioGeneration({
  sourceType,
  sourceId,
}: UseAudioGenerationOptions): UseAudioGenerationReturn {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAudio = useCallback(async () => {
    if (isGenerating || !sourceId) {
      return;
    }

    setIsGenerating(true);
    try {
      if (sourceType === 'article') {
        await generateArticleAudio(sourceId);
      } else {
        await generateTranscriptionAudio(sourceId);
      }

      toast.success(MESSAGES.SUCCESS.AUDIO_GENERATION_QUEUED);

      // The audio badges on the Articles and YouTube lists read audio-jobs,
      // and the Audio Library lists the finished files. Both are stale the
      // moment a job is queued, so the badge changes without a reload.
      queryClient.invalidateQueries({ queryKey: ['audio-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['audio-library'] });
      queryClient.invalidateQueries({
        queryKey:
          sourceType === 'article'
            ? ['article', sourceId]
            : ['youtube-transcription', sourceId],
      });
    } catch (err) {
      toast.error(`${MESSAGES.ERROR.AUDIO_GENERATION} ${getErrorMessage(err)}`);
    } finally {
      setIsGenerating(false);
    }
  }, [sourceType, sourceId, isGenerating, queryClient]);

  return {
    generateAudio,
    isGenerating,
  };
}
