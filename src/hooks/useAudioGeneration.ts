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
      sourceType === 'article'
        ? await generateArticleAudio(sourceId)
        : await generateTranscriptionAudio(sourceId);

      toast.success(MESSAGES.SUCCESS.AUDIO_GENERATION_QUEUED);

      if (sourceType === 'article') {
        queryClient.invalidateQueries({ queryKey: ['article', sourceId] });
      } else {
        queryClient.invalidateQueries({
          queryKey: ['youtube-transcription', sourceId],
        });
      }
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
