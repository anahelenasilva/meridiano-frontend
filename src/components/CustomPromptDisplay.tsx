import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface CustomPromptDisplayProps {
  customPrompt: string;
}

export function CustomPromptDisplay({ customPrompt }: CustomPromptDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-md border border-border"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
        <span>Custom instruction used</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {customPrompt}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
