import ArchiveButton from "@/components/ArchiveButton";
import ArticleCard from "@/components/ArticleCard";
import { AudioSection } from "@/components/AudioSection";
import { CustomPromptDisplay } from "@/components/CustomPromptDisplay";
import EditArticleModal from "@/components/EditArticleModal";
import { NoteEditor } from "@/components/NoteEditor";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { useArticle, useArticles, useBookmarkCheck, useToggleBookmark } from "@/hooks/useApi";
import { useAudioGeneration } from "@/hooks/useAudioGeneration";
import { format } from "date-fns";
import DOMPurify from "dompurify";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Loader2, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";

export default function ArticleDetail() {
  const { id } = useParams();
  const { data, isLoading } = useArticle(id);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: bookmarkStatus } = useBookmarkCheck(id);
  const { add, remove } = useToggleBookmark();
  const isBookmarked = bookmarkStatus?.bookmarked ?? false;
  const { generateAudio, isGenerating } = useAudioGeneration({
    sourceType: "article",
    sourceId: id,
  });

  const handleToggleBookmark = () => {
    if (!id) {
      return;
    }
    if (isBookmarked) {
      remove.mutate(id);
    } else {
      add.mutate(id);
    }
  };

  // Fetch all articles for prev/next and related
  const { data: allData } = useArticles({ perPage: 50 });

  // Memoized sanitized content (must be at top level, not after early returns).
  // Both are undefined until the article loads.
  const processedContentHtml = data?.article?.processed_content_html;
  const sanitizedProcessedContentHtml = useMemo(
    () => (processedContentHtml ? DOMPurify.sanitize(processedContentHtml) : ""),
    [processedContentHtml]
  );

  const contentHtml = data?.article?.content_html;
  const sanitizedContentHtml = useMemo(
    () => (contentHtml ? DOMPurify.sanitize(contentHtml) : ""),
    [contentHtml]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const article = data?.article;
  const audio = article?.audio;

  if (!article) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p>Article not found.</p>
        <Link to="/articles" className="text-primary underline mt-2 inline-block">
          Back to articles
        </Link>
      </div>
    );
  }

  const allArticles = allData?.articles ?? [];
  const articleIndex = allArticles.findIndex((a) => a.id === id);
  const prevArticle = articleIndex > 0 ? allArticles[articleIndex - 1] : null;
  const nextArticle = articleIndex < allArticles.length - 1 ? allArticles[articleIndex + 1] : null;
  const primaryCategory = article.categories?.[0];
  const related = allArticles
    .filter((a) => a.id !== article.id && primaryCategory && a.categories?.includes(primaryCategory))
    .slice(0, 3);

  const displayDate = article.published_date ? format(new Date(article.published_date), "MMM d, yyyy") : "";

  return (
    <div className="flex gap-8">
      {/* Prev/Next nav */}
      <div className="hidden lg:flex flex-col items-center pt-16 gap-2 w-12 shrink-0">
        {prevArticle ? (
          <Link
            to={`/articles/${prevArticle.id}`}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            <ChevronUp className="h-4 w-4" />
          </Link>
        ) : (
          <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground/30">
            <ChevronUp className="h-4 w-4" />
          </div>
        )}
        {nextArticle ? (
          <Link
            to={`/articles/${nextArticle.id}`}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </Link>
        ) : (
          <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground/30">
            <ChevronDown className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Main content */}
      <article className="flex-1 min-w-0">
        <BackButton fallback="/articles" />
        <p className="text-xs font-medium uppercase tracking-widest text-primary mb-4">{article.feed_source}</p>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3">{article.title}</h1>

        <p className="text-lg text-muted-foreground leading-relaxed mb-4">{article.summary}</p>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{article.feed_source?.[0] || "?"}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{article.feed_source}</p>
            <p className="text-xs text-muted-foreground">
              {displayDate}
              {primaryCategory && ` · ${primaryCategory}`}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="gap-1.5"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <button
            type="button"
            onClick={handleToggleBookmark}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <ArchiveButton
            articleId={article.id}
            archivedAt={article.archived_at ?? null}
          />
        </div>

        {article.image_url && (
          <div className="border-t border-border pt-6 mb-6">
            <div className="mb-6">
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full max-h-96 rounded-lg object-cover"
                />
              </a>
            </div>
          </div>
        )}

        <AudioSection
          audio={audio}
          onGenerate={generateAudio}
          isGenerating={isGenerating}
          sectionLabel="Listen to article"
          className="mb-4"
        />

        {article.custom_prompt && (
          <div className="mb-6">
            <CustomPromptDisplay customPrompt={article.custom_prompt} />
          </div>
        )}

        <div className="mb-6">
          <NoteEditor sourceType="article" sourceId={article.id} note={article.note} mode="expanded" />
        </div>

        {sanitizedProcessedContentHtml && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">AI Summary</h2>

            <div className="prose max-w-none mt-6 rounded-lg border border-border bg-card p-4 mb-6"
              dangerouslySetInnerHTML={{ __html: sanitizedProcessedContentHtml }}
            />
          </div>
        )}

        {article.content_html && (
          <section className="mt-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
              Full Article
            </h2>
            <div className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedContentHtml }}>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-10 pt-6 border-t border-border">
            <h2 className="font-serif text-xl font-bold mb-4">More in {primaryCategory}</h2>
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </section>
        )}
      </article>

      <div className="hidden lg:block w-12 shrink-0" />

      {isEditOpen && (
        <EditArticleModal
          article={article}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </div>
  );
}
