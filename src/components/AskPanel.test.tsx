import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AskPanel } from "./AskPanel";

type AskVariables = {
  question: string;
  model?: string;
  history: { question: string; answer: string }[];
};
type AskCallbacks = {
  onSuccess: (data: { answer: string; model: string; truncated: boolean }) => void;
  onError: (error: Error) => void;
};

const mockMutate = vi.fn<(variables: AskVariables, callbacks: AskCallbacks) => void>();

const chatModels = [
  { id: "openai", label: "OpenAI", model_name: "gpt-6-luna", is_default: false },
  { id: "deepseek", label: "DeepSeek", model_name: "deepseek-flash", is_default: true },
];

vi.mock("@/hooks/useApi", () => ({
  useAsk: () => ({ mutate: mockMutate, isPending: false }),
  useAskModels: () => ({ data: chatModels }),
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

function openModelPicker() {
  const picker = screen.getByRole("combobox", { name: /chat model/i });
  fireEvent.keyDown(picker, { key: "Enter" });
  return screen.getByRole("listbox");
}

describe("AskPanel", () => {
  beforeEach(() => {
    mockMutate.mockReset();
  });

  it("lists the server's chat models with the default selected", () => {
    render(<AskPanel sourceType="article" sourceId="article-1" />);

    expect(screen.getByRole("combobox", { name: /chat model/i })).toHaveTextContent("DeepSeek");
    const options = within(openModelPicker()).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["OpenAI", "DeepSeek"]);
  });

  it("sends the picked model with the next question", () => {
    answerWith("An answer.");
    render(<AskPanel sourceType="article" sourceId="article-1" />);

    fireEvent.click(within(openModelPicker()).getByRole("option", { name: "OpenAI" }));
    askQuestion("Which model is this?");

    expect(mockMutate.mock.calls[0][0]).toMatchObject({ model: "openai" });
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
