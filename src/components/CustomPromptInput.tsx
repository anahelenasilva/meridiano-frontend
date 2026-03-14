import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";

interface CustomPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

const MAX_LENGTH = 500;

export function CustomPromptInput({
  value,
  onChange,
  maxLength = MAX_LENGTH,
}: CustomPromptInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ChevronRight
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
        Add custom instruction
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pt-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          rows={3}
          placeholder='e.g., "Extract step-by-step instructions and list all CLI commands mentioned."'
        />
        <p className="text-xs text-muted-foreground text-right">
          {value.length}/{maxLength}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
