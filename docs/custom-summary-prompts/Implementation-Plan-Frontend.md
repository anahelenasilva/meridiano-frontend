## Implementation Plan

### 1. Types — Extend `src/types/index.ts`

Both `Article` and `YouTubeTranscription` live in `src/types/index.ts`, which is the canonical types file imported by both `src/services/api.ts` and `src/hooks/useApi.ts`. Add `custom_prompt` to each interface there.

```ts
// In the Article interface
custom_prompt?: string | null;

// In the YouTubeTranscription interface
custom_prompt?: string | null;
```

> **Note:** `src/types/api.ts` contains a partial duplicate of these interfaces and is not imported anywhere. Audit it and delete it — leaving it will cause drift.

---

### 2. Service Layer — Extend `src/services/api.ts`

Do not create new service files. The project uses standalone named functions in a single `src/services/api.ts` module — extend that file directly.

**Update `createArticleByLink`:**

```ts
export async function createArticleByLink(
  url: string,
  feedProfile?: string,
  customPrompt?: string,
) {
  return apiFetch<{ id: string }>("/api/articles", {
    method: "POST",
    body: JSON.stringify({
      url,
      feedProfile,
      ...(customPrompt ? { customPrompt } : {}),
    }),
  });
}
```

**Update `addArticleFromMarkdown` and `uploadArticleMarkdown`:**

The markdown flow is a 3-step S3 process. Thread `customPrompt` through both functions:

```ts
export async function addArticleFromMarkdown(
  s3Key: string,
  feedProfile?: string,
  customPrompt?: string,
): Promise<{ jobId: string; message: string }> {
  return apiFetch<{ jobId: string; message: string }>("/api/articles/markdown", {
    method: "POST",
    body: JSON.stringify({
      s3Key,
      feedProfile,
      ...(customPrompt ? { customPrompt } : {}),
    }),
  });
}

export async function uploadArticleMarkdown(
  file: File,
  feedProfile?: string,
  customPrompt?: string,
): Promise<{ jobId: string; message: string }> {
  const presignedUrlResponse = await getPresignedUrl(file.name);
  const { url, fields } = presignedUrlResponse;
  const s3Key = fields.key;

  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", file);

  const s3Response = await fetch(url, { method: "POST", body: formData });
  if (!s3Response.ok) {
    throw new Error(`S3 upload failed: ${s3Response.statusText}`);
  }

  return addArticleFromMarkdown(s3Key, feedProfile, customPrompt);
}
```

**Update `createTranscription`:**

```ts
export async function createTranscription(
  url: string,
  channelId?: string,
  customPrompt?: string,
) {
  return apiFetch<{ jobId: string; message: string }>("/api/youtube/transcriptions", {
    method: "POST",
    body: JSON.stringify({
      url,
      channelId,
      ...(customPrompt ? { customPrompt } : {}),
    }),
  });
}
```

---

### 3. Hooks — Extend `src/hooks/useApi.ts`

Update the mutation input types to accept `customPrompt` and thread it through to the service functions.

**`useCreateArticleByLink`:**

```ts
export function useCreateArticleByLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      url,
      feedProfile,
      customPrompt,
    }: {
      url: string;
      feedProfile?: string;
      customPrompt?: string;
    }) => createArticleByLink(url, feedProfile, customPrompt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
```

**`useUploadArticleMarkdown`:**

```ts
export function useUploadArticleMarkdown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      feedProfile,
      customPrompt,
    }: {
      file: File;
      feedProfile?: string;
      customPrompt?: string;
    }) => uploadArticleMarkdown(file, feedProfile, customPrompt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
```

**`useAddTranscription`:**

```ts
export function useAddTranscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      url,
      channelId,
      customPrompt,
    }: {
      url: string;
      channelId?: string;
      customPrompt?: string;
    }) => createTranscription(url, channelId, customPrompt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtube-transcriptions"] });
    },
  });
}
```

---

### 4. Shared Components — `src/components/`

Use the existing `Collapsible` and `Textarea` primitives from the project's component library. Do not roll custom collapsible logic.

**`src/components/CustomPromptInput.tsx`** — Collapsible textarea for creation forms

```tsx
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
```

**`src/components/CustomPromptDisplay.tsx`** — Collapsible accordion for detail views

```tsx
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
```

**`src/components/CustomPromptBadge.tsx`** — Small indicator for list views

```tsx
interface CustomPromptBadgeProps {
  title?: string;
}

export function CustomPromptBadge({
  title = "Has custom instruction",
}: CustomPromptBadgeProps) {
  return (
    <span
      title={title}
      className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    >
      Custom
    </span>
  );
}
```

---

### 5. Integration Points

Wire into the **existing** modal components using the hooks layer. All new state must also be reset on modal close and success.

**`src/components/AddArticleModal.tsx`** — add `customPrompt` state:

```tsx
import { CustomPromptInput } from "@/components/CustomPromptInput";

// Add to existing state declarations
const [customPrompt, setCustomPrompt] = useState("");

// In handleAddArticle, pass customPrompt to both mutation calls:
await createByLink.mutateAsync({
  url: articleUrl,
  feedProfile: articleProfile,
  customPrompt: customPrompt.trim() || undefined,
});
// ...and for the upload path:
await uploadMarkdown.mutateAsync({
  file: selectedFile,
  feedProfile: articleProfile,
  customPrompt: customPrompt.trim() || undefined,
});

// In the success/reset block, add:
setCustomPrompt("");

// In JSX, add before the submit button (inside the form's space-y-5 div):
<CustomPromptInput value={customPrompt} onChange={setCustomPrompt} />
```

**`src/components/AddTranscriptionModal.tsx`** — add `customPrompt` state:

```tsx
import { CustomPromptInput } from "@/components/CustomPromptInput";

// Add to existing state declarations
const [customPrompt, setCustomPrompt] = useState("");

// In handleAddVideo, pass customPrompt:
await addTranscription.mutateAsync({
  url: videoUrl.trim(),
  channelId: selectedChannelId,
  customPrompt: customPrompt.trim() || undefined,
});

// In the success/reset block and in handleOpenChange, add:
setCustomPrompt("");

// In JSX, add before the submit button:
<CustomPromptInput value={customPrompt} onChange={setCustomPrompt} />
```

**Article detail page** — after the summary section:

```tsx
import { CustomPromptDisplay } from "@/components/CustomPromptDisplay";

{article.custom_prompt && (
  <CustomPromptDisplay customPrompt={article.custom_prompt} />
)}
```

**Article list item (`ArticleCard`)** — next to the title or metadata:

```tsx
import { CustomPromptBadge } from "@/components/CustomPromptBadge";

{article.custom_prompt && <CustomPromptBadge />}
```

Same pattern applies to the YouTube transcription detail page and list item.

> **Before wiring the badge on list views**, confirm that the list API responses (`GET /api/articles`, `GET /api/youtube/transcriptions`) return `custom_prompt` in each item. If not, a backend ticket is needed before the badge integration makes sense.

---

### 6. Tests

**`src/components/CustomPromptInput.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CustomPromptInput } from "./CustomPromptInput";

describe("CustomPromptInput", () => {
  it("is collapsed by default", () => {
    render(<CustomPromptInput value="" onChange={vi.fn()} />);
    expect(
      screen.queryByPlaceholderText(/extract step/i)
    ).not.toBeInTheDocument();
  });

  it("expands when toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<CustomPromptInput value="" onChange={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: /add custom instruction/i })
    );

    expect(
      screen.getByPlaceholderText(/extract step/i)
    ).toBeInTheDocument();
  });

  it("calls onChange when user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CustomPromptInput value="" onChange={onChange} />);

    await user.click(
      screen.getByRole("button", { name: /add custom instruction/i })
    );
    await user.type(screen.getByPlaceholderText(/extract step/i), "Test");

    expect(onChange).toHaveBeenCalled();
  });

  it("displays character count", async () => {
    const user = userEvent.setup();
    render(<CustomPromptInput value="Hello" onChange={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: /add custom instruction/i })
    );

    expect(screen.getByText("5/500")).toBeInTheDocument();
  });
});
```

**`src/components/CustomPromptDisplay.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CustomPromptDisplay } from "./CustomPromptDisplay";

describe("CustomPromptDisplay", () => {
  const prompt = "Extract step-by-step instructions";

  it("shows label but hides content by default", () => {
    render(<CustomPromptDisplay customPrompt={prompt} />);
    expect(
      screen.getByRole("button", { name: /custom instruction used/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(prompt)).not.toBeInTheDocument();
  });

  it("reveals content on click", async () => {
    const user = userEvent.setup();
    render(<CustomPromptDisplay customPrompt={prompt} />);

    await user.click(
      screen.getByRole("button", { name: /custom instruction used/i })
    );

    expect(screen.getByText(prompt)).toBeInTheDocument();
  });
});
```

**`src/components/CustomPromptBadge.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CustomPromptBadge } from "./CustomPromptBadge";

describe("CustomPromptBadge", () => {
  it("renders with default title", () => {
    render(<CustomPromptBadge />);
    expect(screen.getByText(/custom/i)).toBeInTheDocument();
    expect(screen.getByTitle("Has custom instruction")).toBeInTheDocument();
  });
});
```

---

### File Summary

| File                                          | Action                                          |
| --------------------------------------------- | ----------------------------------------------- |
| `src/types/index.ts`                          | Add `custom_prompt?: string \| null` to `Article` and `YouTubeTranscription` |
| `src/types/api.ts`                            | Audit and delete (stale duplicate)              |
| `src/services/api.ts`                         | Extend `createArticleByLink`, `addArticleFromMarkdown`, `uploadArticleMarkdown`, `createTranscription` with optional `customPrompt` |
| `src/hooks/useApi.ts`                         | Extend `useCreateArticleByLink`, `useUploadArticleMarkdown`, `useAddTranscription` mutation input types |
| `src/components/CustomPromptInput.tsx`        | **New** — uses `Collapsible` + `Textarea`       |
| `src/components/CustomPromptInput.test.tsx`   | **New**                                         |
| `src/components/CustomPromptDisplay.tsx`      | **New** — uses `Collapsible`                    |
| `src/components/CustomPromptDisplay.test.tsx` | **New**                                         |
| `src/components/CustomPromptBadge.tsx`        | **New**                                         |
| `src/components/CustomPromptBadge.test.tsx`   | **New**                                         |
| `src/components/AddArticleModal.tsx`          | Wire `CustomPromptInput` + state + reset        |
| `src/components/AddTranscriptionModal.tsx`    | Wire `CustomPromptInput` + state + reset        |
| Existing article detail page                  | Wire `CustomPromptDisplay`                      |
| Existing article list item (`ArticleCard`)    | Wire `CustomPromptBadge`                        |
| Existing transcription detail page            | Wire `CustomPromptDisplay`                      |
| Existing transcription list item              | Wire `CustomPromptBadge`                        |
