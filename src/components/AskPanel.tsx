import { useState, type FormEvent, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppendNote, useAsk, useAskModels } from "@/hooks/useApi";
import type { AskModel } from "@/services/api";
import { getErrorMessage } from "@/utils/api-error";

type NoteSave = { state: "saving" } | { state: "saved" } | { state: "failed"; error: string };

interface AskTurn {
  question: string;
  answer: string;
  model: string;
  truncated: boolean;
  noteSave?: NoteSave;
}

const saveButtonLabel = { idle: "Save to note", saving: "Saving...", saved: "Saved to note", failed: "Save to note" } as const;

interface AskPanelProps {
  sourceType: "article" | "transcription";
  sourceId: string;
}

/**
 * Questions about one source's text, answered by the chat model. The turns live
 * in this component's state only, so render it with `key={sourceId}` to start a
 * fresh Ask when the page switches source.
 */
export function AskPanel({ sourceType, sourceId }: AskPanelProps) {
  const [turns, setTurns] = useState<AskTurn[]>([]);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const askMutation = useAsk();
  const appendNoteMutation = useAppendNote();
  const { data: models } = useAskModels();
  const [pickedModel, setPickedModel] = useState<AskModel["id"] | null>(null);
  // Until the owner picks one, follow the server's default. If the list fails
  // to load, the request leaves `model` out and the server uses its default.
  const model = pickedModel ?? models?.find((candidate) => candidate.is_default)?.id;

  const canAsk = question.trim().length > 0 && !askMutation.isPending;

  function submit() {
    if (!canAsk) return;
    setError(null);
    askMutation.mutate(
      {
        sourceType,
        sourceId,
        question,
        model,
        history: turns.map((turn) => ({ question: turn.question, answer: turn.answer })),
      },
      {
        onSuccess: (data) => {
          setTurns((previous) => [...previous, { question, ...data }]);
          setQuestion("");
        },
        onError: (err) => setError(getErrorMessage(err)),
      },
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  function setNoteSave(index: number, noteSave: NoteSave) {
    setTurns((previous) => previous.map((turn, i) => (i === index ? { ...turn, noteSave } : turn)));
  }

  // mutateAsync, not mutate: mutate's per-call callbacks fire only for the
  // latest call, so two turns saved at once would lose the first one's result.
  async function saveToNote(index: number) {
    const turn = turns[index];
    setNoteSave(index, { state: "saving" });
    try {
      await appendNoteMutation.mutateAsync({
        sourceType,
        sourceId,
        content: `**Q:** ${turn.question}\n\n${turn.answer}`,
      });
      setNoteSave(index, { state: "saved" });
    } catch (err) {
      setNoteSave(index, { state: "failed", error: getErrorMessage(err) });
    }
  }

  function clearConversation() {
    setTurns([]);
    setError(null);
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg sm:text-xl font-semibold">Ask</h2>
        {turns.length > 0 && (
          <Button type="button" size="sm" variant="ghost" onClick={clearConversation}>
            Clear conversation
          </Button>
        )}
      </div>

      {turns.length > 0 && (
        <ol className="space-y-4 mb-4">
          {turns.map((turn, index) => (
            <li key={index} className="rounded-lg border border-border bg-card p-4">
              <p className="font-medium mb-2">{turn.question}</p>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{turn.answer}</ReactMarkdown>
              </div>
              {turn.truncated && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Only the first part of this source was read, so this answer may miss the end.
                </p>
              )}
              <div className="flex items-center justify-between gap-2 mt-2">
                <p className="text-xs text-muted-foreground">Answered by {turn.model}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={turn.noteSave?.state === "saving" || turn.noteSave?.state === "saved"}
                  onClick={() => saveToNote(index)}
                >
                  {saveButtonLabel[turn.noteSave?.state ?? "idle"]}
                </Button>
              </div>
              {turn.noteSave?.state === "failed" && (
                <p className="text-xs text-destructive mt-2">{turn.noteSave.error}</p>
              )}
            </li>
          ))}
        </ol>
      )}

      <form onSubmit={handleSubmit}>
        <Textarea
          aria-label="Question about this source"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={askMutation.isPending}
          rows={2}
          placeholder="Ask a question about this text..."
        />
        <div className="flex items-center gap-2 mt-2">
          <Button type="submit" size="sm" disabled={!canAsk}>
            {askMutation.isPending ? "Asking..." : "Ask"}
          </Button>
          {models && models.length > 0 && (
            <Select
              value={model}
              onValueChange={(value) =>
                setPickedModel(models.find((candidate) => candidate.id === value)?.id ?? null)
              }
            >
              <SelectTrigger aria-label="Chat model" className="h-9 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </form>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </section>
  );
}
