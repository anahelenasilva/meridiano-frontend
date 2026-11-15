import { useState, type FormEvent, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAsk } from "@/hooks/useApi";
import { getErrorMessage } from "@/utils/api-error";

interface AskTurn {
  question: string;
  answer: string;
  model: string;
  truncated: boolean;
}

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

  const canAsk = question.trim().length > 0 && !askMutation.isPending;

  function submit() {
    if (!canAsk) return;
    setError(null);
    askMutation.mutate(
      {
        sourceType,
        sourceId,
        question,
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
              <p className="text-xs text-muted-foreground mt-2">Answered by {turn.model}</p>
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
        </div>
      </form>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </section>
  );
}
