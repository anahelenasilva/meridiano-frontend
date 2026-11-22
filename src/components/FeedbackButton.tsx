import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import FeedbackModal from "./FeedbackModal";

/** Floating button in the bottom-right corner of every page under the layout. */
export default function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        title="Send feedback"
        className="fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:bottom-6 md:right-6"
      >
        <MessageSquarePlus className="h-5 w-5" />
      </button>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </>
  );
}
