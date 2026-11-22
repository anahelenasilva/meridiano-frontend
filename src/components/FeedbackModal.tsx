import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGES } from "@/constants/messages";
import { useSubmitFeedback } from "@/hooks/useApi";
import {
  canSubmitFeedback,
  FEEDBACK_MESSAGE_MAX_LENGTH,
  feedbackErrorMessage,
  feedbackPageContext,
} from "@/utils/feedback";
import { toast } from "@/utils/toast";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLocation } from "react-router";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const submitFeedbackMutation = useSubmitFeedback();

  const isPending = submitFeedbackMutation.isPending;
  const canSubmit = canSubmitFeedback(message) && !isPending;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);
    try {
      const { issueUrl } = await submitFeedbackMutation.mutateAsync({
        message: message.trim(),
        pageContext: feedbackPageContext(location.pathname, location.search),
      });
      toast.success(
        <span>
          {MESSAGES.SUCCESS.FEEDBACK_SENT}:{" "}
          <a href={issueUrl} target="_blank" rel="noreferrer" className="underline break-all">
            {issueUrl}
          </a>
        </span>,
        // Long enough to click the link.
        { autoClose: 8000, closeOnClick: false },
      );
      setMessage("");
      onOpenChange(false);
    } catch (e) {
      // The typed text stays, so the user can retry without losing it.
      setError(feedbackErrorMessage(e));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Send feedback</DialogTitle>
          <DialogDescription>
            Something to fix or change? It becomes an issue, along with the page you are on.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="feedback-message" className="text-muted-foreground block">
              Feedback
            </Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={FEEDBACK_MESSAGE_MAX_LENGTH}
              rows={6}
              placeholder="What should change?"
              className="bg-background"
            />
            <p className="text-right text-xs text-muted-foreground">
              {message.length}/{FEEDBACK_MESSAGE_MAX_LENGTH}
            </p>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4 min-w-0 flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
              Send feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
