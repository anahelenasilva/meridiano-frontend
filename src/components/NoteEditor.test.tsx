import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NoteEditor } from "./NoteEditor";

const mockMutate = vi.fn();

vi.mock("@/hooks/useApi", () => ({
  useSaveNote: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

describe("NoteEditor", () => {
  beforeEach(() => {
    mockMutate.mockReset();
  });

  it("updates when the note prop arrives after the initial render", () => {
    const { rerender } = render(
      <NoteEditor sourceType="article" sourceId="article-1" note={null} />
    );

    expect(screen.getByPlaceholderText(/add a private note/i)).toHaveValue("");

    rerender(
      <NoteEditor
        sourceType="article"
        sourceId="article-1"
        note={{
          id: "n1",
          content: "Loaded note",
          created_at: "2024-01-01",
          updated_at: "2024-01-02",
        }}
      />
    );

    expect(screen.getByDisplayValue("Loaded note")).toBeInTheDocument();
  });

  it("renders collapsed preview and expands into the editor", () => {
    render(
      <NoteEditor
        sourceType="article"
        sourceId="article-1"
        mode="collapsed"
        note={{
          id: "n1",
          content: "Preview note",
          created_at: "2024-01-01",
          updated_at: "2024-01-02",
        }}
      />
    );

    expect(screen.getByText("Preview note")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /edit note/i }));

    expect(screen.getByDisplayValue("Preview note")).toBeInTheDocument();
  });

  it("saves whitespace-only content as a clear note and keeps typed text on failure", () => {
    mockMutate.mockImplementation((payload, options) => {
      if (payload.content === "") {
        options?.onSuccess?.({ note: null });
        return;
      }

      options?.onError?.(new Error("boom"));
    });

    render(
      <NoteEditor
        sourceType="article"
        sourceId="article-1"
        note={null}
      />
    );

    const textarea = screen.getByPlaceholderText(/add a private note/i);

    fireEvent.change(textarea, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      {
        sourceType: "article",
        sourceId: "article-1",
        content: "",
      },
      expect.any(Object)
    );
    expect(textarea).toHaveValue("");

    fireEvent.change(textarea, { target: { value: "keep me" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByText("boom")).toBeInTheDocument();
    expect(textarea).toHaveValue("keep me");
  });
});
