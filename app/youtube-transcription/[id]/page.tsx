'use client';

import { YoutubeThumbnail } from '@/src/components/YoutubeThumbnail';
import { apiService } from '@/src/services/api';
import type { YoutubeTranscriptionDetailResponse } from '@/src/types/api';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, TrashIcon } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function YoutubeTranscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transcriptionId = params?.id as string;

  const { data, isLoading, error } = useQuery<YoutubeTranscriptionDetailResponse>({
    queryKey: ['youtube-transcription', transcriptionId],
    queryFn: async () => {
      const response = await apiService.getYoutubeTranscription(transcriptionId);
      return response.data;
    },
    enabled: !!transcriptionId,
  });

  const deleteTranscription = async () => {
    if (!confirm('Are you sure you want to delete this transcription?')) {
      return;
    }
    
    await apiService.deleteYoutubeTranscription(transcriptionId);
    alert('Transcription deleted successfully');

    // Redirect to transcriptions list after deletion
    router.push('/youtube-transcriptions');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data || !data.transcription) {
    console.log("data", JSON.stringify(data));
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">
          Error loading transcription
        </div>
        <Link
          href="/youtube-transcriptions"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Transcriptions
        </Link>
      </div>
    );
  }

  const { transcription, related_transcriptions } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <Link
          href="/youtube-transcriptions"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Transcriptions</span>
        </Link>
        {transcription.channelName && (
          <Link
            href={`/youtube-transcriptions?channel_name=${encodeURIComponent(transcription.channelName)}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            View more from {transcription.channelName}
          </Link>
        )}
      </div>

      {/* Transcription Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Thumbnail */}
        <div className="w-full aspect-video relative bg-gray-100">
          <a
            href={transcription.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full"
          >
            <YoutubeThumbnail
              videoUrl={transcription.videoUrl}
              alt={transcription.videoTitle}
              fill
              className="object-contain hover:opacity-90 transition-opacity"
              priority
            />
          </a>
        </div>

        <div className="p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {transcription.videoTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              {/* <Youtube className="h-4 w-4 text-red-600" /> */}
              <svg role="img" className='h-4 w-4 text-red-600' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>YouTube</title><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                {transcription.channelName}
              </span>
            </div>
            {transcription.postedAt && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{moment(transcription.postedAt).format('MMMM D, YYYY [at] h:mm A')}</span>
              </div>
            )}
            <div className="text-gray-500">
              Processed: {moment(transcription.processedAt).format('MMMM D, YYYY [at] h:mm A')}
            </div>
            <div className="text-xs text-gray-500">
              Channel ID: {transcription.channelId}
            </div>
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div>
              <a
                href={transcription.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <svg role="img" className='h-5 w-5' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>YouTube</title><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                {/* <Youtube className="h-5 w-5" /> */}
                <span>Watch on YouTube</span>
              </a>
            </div>

            <div>
              <button
                type="button"
                onClick={deleteTranscription}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
                <span>Delete Transcription</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transcription Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        {transcription.transcriptionSummary && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Summary</h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {transcription.transcriptionSummary}
            </div>
          </div>
        )}

        {transcription.transcriptionText && (
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Full Transcription</h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {transcription.transcriptionText}
            </div>
          </div>
        )}
      </div>

      {/* Related Transcriptions */}
      {/* {related_transcriptions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Related Transcriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {related_transcriptions.map((relatedTranscription) => (
              <div
                key={relatedTranscription.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <Link
                  href={`/youtube-transcription/${relatedTranscription.id}`}
                  className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2"
                >
                  {relatedTranscription.videoTitle}
                </Link>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                <svg role="img" className='h-3 w-3 text-red-600' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>YouTube</title><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  // <Youtube className="h-3 w-3 text-red-600" />
                  <span className="text-xs">{relatedTranscription.channelName}</span>
                  {relatedTranscription.postedAt && (
                    <>
                      <span>•</span>
                      <span className="text-xs">{moment(relatedTranscription.postedAt).format('MMM D, YYYY')}</span>
                    </>
                  )}
                </div>
                {relatedTranscription.transcriptionSummary && (
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {relatedTranscription.transcriptionSummary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}
