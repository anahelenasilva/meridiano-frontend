import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSaveNote } from "@/hooks/useApi";
import type { Note } from "@/types";
import { getErrorMessage } from "@/utils/api-error";

const MAX_LENGTH = 5000;
const WARNING_THRESHOLD = 500;

interface NoteEditorProps {
  sourceType: "article" | "transcription";
  sourceId: string;
  note: Note | null | undefined;
  mode?: "expanded" | "collapsed";
}

export function NoteEditor({ sourceType, sourceId, note, mode = "expanded" }: NoteEditorProps) {
  const [content, setContent] = useState(note?.content ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(mode === "expanded");
  const saveNoteMutation = useSaveNote();

  useEffect(() => {
    setContent(note?.content ?? "");
    setError(null);
  }, [sourceId]);

  const handleSave = () => {
    setError(null);
    saveNoteMutation.mutate(
      { sourceType, sourceId, content },
      {
        onSuccess: (result) => {
          setContent(result.note?.content ?? "");
          if (mode === "collapsed") {
            setIsExpanded(false);
          }
        },
        onError: (err) => {
          setError(getErrorMessage(err));
        },
      },
    );
  };

  const handleCancel = () => {
    setContent(note?.content ?? "");
    setError(null);
    setIsExpanded(false);
  };

  const isEmpty = content.trim() === "";
  const remaining = MAX_LENGTH - content.length;
  const showCounter = remaining <= WARNING_THRESHOLD;

  if (mode === "collapsed" && !isExpanded) {
    const hasNote = Boolean(note?.content?.trim());

    return (
      <div className="rounded-md border border-border p-3">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full text-left"
        >
          {hasNote ? (
            <>
              <p className="text-sm text-muted-foreground line-clamp-2">{note?.content}</p>
              <span className="mt-1 inline-block text-xs font-medium text-primary">Edit note</span>
            </>
          ) : (
            <span className="text-sm font-medium text-primary">Add note</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={mode === "collapsed" ? "rounded-md border border-border p-3" : undefined}>
      {mode === "expanded" && <h2 className="text-lg sm:text-xl font-semibold mb-2">Note</h2>}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={MAX_LENGTH}
        rows={4}
        placeholder="Add a private note..."
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saveNoteMutation.isPending}
          >
            {saveNoteMutation.isPending ? "Saving..." : isEmpty ? "Clear" : "Save"}
          </Button>
          {mode === "collapsed" && (
            <Button type="button" size="sm" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
        {showCounter && (
          <p className="text-xs text-muted-foreground">
            {content.length}/{MAX_LENGTH}
          </p>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
