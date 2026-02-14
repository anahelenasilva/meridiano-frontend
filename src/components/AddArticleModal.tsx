import { useState, useRef } from "react";
import {
  useProfiles,
  useCreateArticleByLink,
  useUploadArticleMarkdown,
} from "@/hooks/useApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "@/utils/toast";
import { getErrorMessage } from "@/utils/api-error";

interface AddArticleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddArticleModal({
  open,
  onOpenChange,
}: AddArticleModalProps) {
  const [addMode, setAddMode] = useState<"link" | "upload">("link");
  const [articleUrl, setArticleUrl] = useState("");
  const [articleProfile, setArticleProfile] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profilesData } = useProfiles();
  const createByLink = useCreateArticleByLink();
  const uploadMarkdown = useUploadArticleMarkdown();

  const profiles = profilesData ?? [];

  const handleAddArticle = async () => {
    try {
      if (addMode === "link") {
        await createByLink.mutateAsync({
          url: articleUrl,
          feedProfile: articleProfile || undefined,
        });
      } else if (selectedFile) {
        await uploadMarkdown.mutateAsync({
          file: selectedFile,
          feedProfile: articleProfile || undefined,
        });
      }
      toast.success("Article added successfully");
      onOpenChange(false);
      setArticleUrl("");
      setSelectedFile(null);
      setArticleProfile("");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Article</DialogTitle>
          <DialogDescription>
            Add an article by link or upload a markdown file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label className="text-muted-foreground mb-2 block">Mode</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="addMode"
                  checked={addMode === "link"}
                  onChange={() => setAddMode("link")}
                  className="accent-primary"
                />
                <span className="text-sm">Link</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="addMode"
                  checked={addMode === "upload"}
                  onChange={() => setAddMode("upload")}
                  className="accent-primary"
                />
                <span className="text-sm">Upload</span>
              </label>
            </div>
          </div>

          {addMode === "link" && (
            <div>
              <Label className="text-muted-foreground mb-2 block">
                Article URL
              </Label>
              <Input
                placeholder="https://example.com/article"
                value={articleUrl}
                onChange={(e) => setArticleUrl(e.target.value)}
                className="bg-background"
              />
            </div>
          )}

          {addMode === "upload" && (
            <div>
              <Label className="text-muted-foreground mb-2 block">
                Markdown File
              </Label>
              <div className="flex items-center gap-3 rounded-md border border-input bg-background p-2">
                <Button
                  size="sm"
                  variant="default"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
                <span className="text-sm text-muted-foreground truncate">
                  {selectedFile ? selectedFile.name : "No file chosen"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown,.txt"
                  className="hidden"
                  onChange={(e) =>
                    setSelectedFile(e.target.files?.[0] ?? null)
                  }
                />
              </div>
            </div>
          )}

          <div>
            <Label className="text-muted-foreground mb-2 block">
              Feed Profile
            </Label>
            <Select value={articleProfile} onValueChange={setArticleProfile}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a profile" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleAddArticle}
            disabled={
              (addMode === "link" && !articleUrl) ||
              (addMode === "upload" && !selectedFile) ||
              createByLink.isPending ||
              uploadMarkdown.isPending
            }
          >
            {createByLink.isPending || uploadMarkdown.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            {addMode === "link" ? "Add Article" : "Upload Article"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
