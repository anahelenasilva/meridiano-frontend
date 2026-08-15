import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useArticles, useProfiles, useUpdateArticle } from "@/hooks/useApi";
import type { Article, UpdateArticlePayload } from "@/types";
import { getErrorMessage } from "@/utils/api-error";
import { toast } from "@/utils/toast";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface EditArticleModalProps {
  article: Article;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Reduce an ISO / date string to the `yyyy-MM-dd` a date input expects. */
function toDateInputValue(value: string | undefined): string {
  if (!value) return "";
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((item) => setB.has(item));
}

export default function EditArticleModal({
  article,
  open,
  onOpenChange,
}: EditArticleModalProps) {
  const originalDate = toDateInputValue(article.published_date);
  const originalCategories = article.categories ?? [];

  const [title, setTitle] = useState(article.title);
  const [publishedDate, setPublishedDate] = useState(originalDate);
  const [source, setSource] = useState(article.feed_source);
  const [feedProfile, setFeedProfile] = useState(article.feed_profile);
  const [categories, setCategories] = useState<string[]>(originalCategories);

  // Re-seed the form whenever a different Article is opened.
  useEffect(() => {
    setTitle(article.title);
    setPublishedDate(toDateInputValue(article.published_date));
    setSource(article.feed_source);
    setFeedProfile(article.feed_profile);
    setCategories(article.categories ?? []);
  }, [article, open]);

  const { data: profilesData } = useProfiles();
  const { data: articlesData } = useArticles({ perPage: 50 });
  const updateArticleMutation = useUpdateArticle();

  const profileOptions = useMemo(() => {
    const set = new Set<string>(profilesData ?? []);
    if (article.feed_profile) set.add(article.feed_profile);
    return [...set];
  }, [profilesData, article.feed_profile]);

  const categoryVocabulary = useMemo(() => {
    const set = new Set<string>();
    (articlesData?.articles ?? []).forEach((a) =>
      (a.categories ?? []).forEach((c) => set.add(c)),
    );
    (article.categories ?? []).forEach((c) => set.add(c));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [articlesData, article.categories]);

  const todayStr = toDateInputValue(new Date().toISOString());

  const trimmedTitle = title.trim();
  const trimmedSource = source.trim();

  const isTitleValid = trimmedTitle.length > 0;
  const isSourceValid = trimmedSource.length > 0;
  const isDateValid =
    publishedDate !== "" &&
    !Number.isNaN(Date.parse(publishedDate)) &&
    publishedDate <= todayStr;
  const isProfileValid = feedProfile.length > 0;
  const isFormValid = isTitleValid && isSourceValid && isDateValid && isProfileValid;

  const buildPatch = (): UpdateArticlePayload => {
    const patch: UpdateArticlePayload = {};
    if (trimmedTitle !== article.title) patch.title = trimmedTitle;
    if (publishedDate !== originalDate) patch.publishedDate = publishedDate;
    if (trimmedSource !== article.feed_source) patch.feedSource = trimmedSource;
    if (feedProfile !== article.feed_profile) patch.feedProfile = feedProfile;
    if (!sameSet(categories, originalCategories)) patch.categories = categories;
    return patch;
  };

  const hasChanges = Object.keys(buildPatch()).length > 0;

  const toggleCategory = (category: string, checked: boolean) => {
    setCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category),
    );
  };

  const handleSave = async () => {
    const patch = buildPatch();
    if (Object.keys(patch).length === 0) return;
    try {
      await updateArticleMutation.mutateAsync({ id: article.id, patch });
      toast.success("Article updated successfully");
      onOpenChange(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Article</DialogTitle>
          <DialogDescription>
            Correct this article's metadata. Only the fields you change are saved.
          </DialogDescription>
        </DialogHeader>

        <div className="min-w-0 space-y-5">
          <div>
            <Label htmlFor="edit-title" className="text-muted-foreground mb-2 block">
              Title
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background"
            />
            {!isTitleValid && (
              <p className="mt-1 text-xs text-destructive">Title is required.</p>
            )}
          </div>

          <div>
            <Label
              htmlFor="edit-published-date"
              className="text-muted-foreground mb-2 block"
            >
              Published date
            </Label>
            <Input
              id="edit-published-date"
              type="date"
              max={todayStr}
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              className="bg-background"
            />
            {!isDateValid && (
              <p className="mt-1 text-xs text-destructive">
                Enter a valid date that is not in the future.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="edit-source" className="text-muted-foreground mb-2 block">
              Source
            </Label>
            <Input
              id="edit-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="bg-background"
            />
            {!isSourceValid && (
              <p className="mt-1 text-xs text-destructive">Source is required.</p>
            )}
          </div>

          <div>
            <Label className="text-muted-foreground mb-2 block">Feed Profile</Label>
            <Select value={feedProfile} onValueChange={setFeedProfile}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a profile" />
              </SelectTrigger>
              <SelectContent>
                {profileOptions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-muted-foreground mb-2 block">Categories</Label>
            {categoryVocabulary.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No categories available.
              </p>
            ) : (
              <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-input bg-background p-3">
                {categoryVocabulary.map((category) => {
                  const checkboxId = `edit-category-${category}`;
                  return (
                    <div key={category} className="flex items-center gap-2">
                      <Checkbox
                        id={checkboxId}
                        checked={categories.includes(category)}
                        onCheckedChange={(v) => toggleCategory(category, !!v)}
                      />
                      <Label
                        htmlFor={checkboxId}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {category}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 min-w-0 flex-wrap gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid || !hasChanges || updateArticleMutation.isPending}
          >
            {updateArticleMutation.isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
