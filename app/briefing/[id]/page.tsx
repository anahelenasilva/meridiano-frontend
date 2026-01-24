'use client';

import { apiService } from '@/src/services/api';
import type { BriefingDetailResponse } from '@/src/types/api';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export default function BriefingDetailPage() {
  const params = useParams();
  const briefingId = params?.id as string;

  const { data: brief, isLoading, error } = useQuery<BriefingDetailResponse>({
    queryKey: ['briefing', briefingId],
    queryFn: async () => {
      const response = await apiService.getBriefing(briefingId);
      return response.data;
    },
    enabled: !!briefingId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 text-lg mb-4">Error loading briefing</div>
        <Link
          href="/"
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          Back to Briefings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Link
          href="/"
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Briefings</span>
        </Link>
        <Link
          href={`/articles?feed_profile=${brief.feed_profile}`}
          className="text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          View related articles
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 leading-tight">
          {brief.feed_profile}
        </h1>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="whitespace-nowrap">{moment(brief.generated_at).format('MMMM D, YYYY [at] h:mm A')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4" />
            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
              {brief.feed_profile}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 lg:p-8">
        <div className="font-medium text-xl sm:text-2xl lg:text-3xl text-blue-900 dark:text-blue-300 mb-2 sm:mb-4">Executive Summary</div>
        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed dark:prose-invert">
          <ReactMarkdown>{brief.brief_markdown}</ReactMarkdown>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link
            href={`/articles?feed_profile=${brief.feed_profile}`}
            className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            View Related Articles
          </Link>
          <Link
            href={`/?feed_profile=${brief.feed_profile}`}
            className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 text-sm sm:text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            More Briefings from {brief.feed_profile}
          </Link>
        </div>
      </div>
    </div>
  );
}

