import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AskPanel } from "./AskPanel";

type AskVariables = { question: string; history: { question: string; answer: string }[] };
type AskCallbacks = {
  onSuccess: (data: { answer: string; model: string; truncated: boolean }) => void;
  onError: (error: Error) => void;
};

const mockMutate = vi.fn<(variables: AskVariables, callbacks: AskCallbacks) => void>();

vi.mock("@/hooks/useApi", () => ({
  useAsk: () => ({ mutate: mockMutate, isPending: false }),
}));

function answerWith(answer: string, truncated = false) {
  mockMutate.mockImplementationOnce((_variables, { onSuccess }) =>
    onSuccess({ answer, model: "deepseek", truncated }),
  );
}

function askQuestion(question: string) {
  fireEvent.change(screen.getByRole("textbox", { name: /question/i }), {
    target: { value: question },
  });
  fireEvent.click(screen.getByRole("button", { name: "Ask" }));
}

describe("AskPanel", () => {
  beforeEach(() => {
    mockMutate.mockReset();
  });

  it("shows the question and the answer rendered as markdown, with the model that answered", () => {
    answerWith("The guest said **three things**.");
    render(<AskPanel sourceType="article" sourceId="article-1" />);

    askQuestion("What did the guest say?");

    expect(screen.getByText("What did the guest say?")).toBeInTheDocument();
    expect(screen.getByText("three things").tagName).toBe("STRONG");
    expect(screen.getByText(/deepseek/)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /question/i })).toHaveValue("");
  });

  it("sends the earlier turns with a follow-up question", () => {
    answerWith("First answer.");
    answerWith("Second answer.");
    render(<AskPanel sourceType="transcription" sourceId="tr-1" />);

    askQuestion("First question?");
    askQuestion("Follow-up?");

    expect(mockMutate.mock.calls[1][0]).toMatchObject({
      question: "Follow-up?",
      history: [{ question: "First question?", answer: "First answer." }],
    });
  });

  it("keeps the question in the input and shows the error when the ask fails", () => {
    mockMutate.mockImplementationOnce((_variables, { onError }) =>
      onError(new Error("The chat model failed to answer")),
    );
    render(<AskPanel sourceType="article" sourceId="article-1" />);

    askQuestion("Will this fail?");

    expect(screen.getByRole("textbox", { name: /question/i })).toHaveValue("Will this fail?");
    expect(screen.getByText(/the chat model failed to answer/i)).toBeInTheDocument();
  });

  it("tells the owner when only part of a long source was read", () => {
    answerWith("Partial answer.", true);
    render(<AskPanel sourceType="transcription" sourceId="tr-1" />);

    askQuestion("What happens at the end?");

    expect(screen.getByText(/only the first part of this source was read/i)).toBeInTheDocument();
  });
});
