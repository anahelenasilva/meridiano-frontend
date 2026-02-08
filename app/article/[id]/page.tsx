'use client';

import AudioPlayer from '@/src/components/AudioPlayer';
import BookmarkButton from '@/src/components/BookmarkButton';
import { MESSAGES } from '@/src/constants/messages';
import { useAudioGeneration } from '@/src/hooks/useAudioGeneration';
import { apiService } from '@/src/services/api';
import type { ArticleDetailResponse } from '@/src/types/api';
import { toast } from '@/src/utils/toast';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, ExternalLink, Loader2, Music, RefreshCw, Tag, TrashIcon } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params?.id as string;

  const { data, isLoading, error } = useQuery<ArticleDetailResponse>({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const response = await apiService.getArticle(articleId, true);
      return response.data;
    },
    enabled: !!articleId,
  });

  const {
    generateAudio,
    isGenerating,
    jobState,
    progress,
    error: generationError,
    reset,
  } = useAudioGeneration({ articleId });

  const deleteArticle = async () => {
    try {
      await apiService.deleteArticle(articleId);
      toast.success(MESSAGES.SUCCESS.ARTICLE_DELETED);

      // Redirect to articles list after deletion
      router.push('/articles');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`${MESSAGES.ERROR.ARTICLE_DELETE}${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error || !data || !data.article) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 text-lg mb-4">
          Error loading article
        </div>
        <Link
          href="/articles"
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          Back to Articles
        </Link>
      </div>
    );
  }

  const { article, related_articles } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Link
          href="/articles"
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Articles</span>
        </Link>
        {article.feed_profile && (
          <Link
            href={`/articles?feed_profile=${article.feed_profile}`}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-sm sm:text-base"
          >
            View more from {article.feed_profile}
          </Link>
        )}
      </div>

      {/* Article Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="h-64 md:h-96 overflow-hidden relative">
          <Image
            src={article.image_url || '/default_article_cover.png'}
            alt={article.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="whitespace-nowrap">{moment(article.published_date).format('MMMM D, YYYY [at] h:mm A')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                {article.feed_profile}
              </span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Source: {article.feed_source}
            </div>
            {article.impact_rating && (
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${article.impact_rating >= 8 ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' :
                article.impact_rating >= 6 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                Impact Rating: {article.impact_rating}/10
              </div>
            )}
            {article.categories && article.categories.length > 0 && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-cyan-200 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300`}>
                Categories: {article.categories.join(', ')}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
                <span>Read Original Article</span>
              </a>
              <BookmarkButton articleId={article.id} showLabel={true} size="lg" />
            </div>

            <div>
              <button
                type="button"
                onClick={deleteArticle}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
                <span>Delete Article</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Player or Generate Audio Button */}
      {article.audio ? (
        <AudioPlayer audio={article.audio} />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Music className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Audio Article
            </h3>
          </div>

          {jobState === 'failed' ? (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
                {generationError || 'Audio generation failed. Please try again.'}
              </div>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
            </div>
          ) : isGenerating ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>
                  {jobState === 'queuing'
                    ? 'Queuing audio generation...'
                    : `Generating audio... ${progress}%`}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Generate an audio version of this article for easy listening.
              </p>
              <button
                type="button"
                onClick={generateAudio}
                disabled={isGenerating}
                className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Music className="h-5 w-5" />
                <span>Generate Audio</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Article Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 lg:p-8">
        {article.processed_content_html && (
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">AI Summary</h2>
            <div
              className="prose prose-sm sm:prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: article.processed_content_html }}
            />
          </div>
        )}

        {article.content_html && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Full Content</h2>
            <div
              className="prose prose-sm sm:prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: article.content_html }}
            />
          </div>
        )}
      </div>

      {/* Related Articles */}
      {related_articles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {related_articles.map((relatedArticle) => (
              <div
                key={relatedArticle.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                <div className="h-32 sm:h-40 overflow-hidden rounded-md mb-3 relative">
                  <Image
                    src={relatedArticle.image_url || '/default_article_cover.png'}
                    alt={relatedArticle.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <Link
                  href={`/article/${relatedArticle.id}`}
                  className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 mb-2 block"
                >
                  {relatedArticle.title}
                </Link>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {moment(relatedArticle.published_date).format('MMM D, YYYY')} • {relatedArticle.feed_source}
                </div>
                {relatedArticle.processed_content && (
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {relatedArticle.processed_content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

