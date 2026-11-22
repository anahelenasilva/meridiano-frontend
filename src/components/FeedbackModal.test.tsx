import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MESSAGES } from "@/constants/messages";
import { FEEDBACK_MESSAGE_MAX_LENGTH } from "@/utils/feedback";
import { toast } from "@/utils/toast";
import FeedbackButton from "./FeedbackButton";

vi.mock("@/utils/toast", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

const issueUrl = "https://github.com/owner/repo/issues/412";

function respond(status: number, body?: unknown) {
  const text = body === undefined ? "" : JSON.stringify(body);
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    json: async () => body,
    text: async () => text,
  } as Response);
}

function renderAt(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <FeedbackButton />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
}

const field = () => screen.getByLabelText("Feedback");
const submitButton = () =>
  screen.getAllByRole("button", { name: "Send feedback" }).find((b) => b.getAttribute("type") === "submit")!;

function feedbackBody(): Record<string, unknown> | null {
  const call = fetchMock.mock.calls.find(([url]) => String(url).includes("/api/feedback"));
  return call ? JSON.parse(call[1].body as string) : null;
}

describe("FeedbackModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
  });

  it("opens a dialog from the floating button", () => {
    renderAt("/articles");
    expect(screen.getByRole("dialog", { name: "Send feedback" })).toBeInTheDocument();
    expect(field()).toHaveAttribute("maxLength", String(FEEDBACK_MESSAGE_MAX_LENGTH));
  });

  it("cannot send an empty or whitespace-only message", () => {
    renderAt("/articles");
    expect(submitButton()).toBeDisabled();
    fireEvent.change(field(), { target: { value: "   \n " } });
    expect(submitButton()).toBeDisabled();
    fireEvent.submit(field().closest("form")!);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the message with the current route, toasts the issue link and closes", async () => {
    fetchMock.mockImplementation(() => respond(201, { issueNumber: 412, issueUrl }));
    renderAt("/articles?page=2");

    fireEvent.change(field(), { target: { value: "  The filters reset  " } });
    fireEvent.click(submitButton());

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(feedbackBody()).toEqual({ message: "The filters reset", pageContext: "/articles?page=2" });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");

    render(<>{vi.mocked(toast.success).mock.calls[0][0]}</>);
    expect(screen.getByText(new RegExp(MESSAGES.SUCCESS.FEEDBACK_SENT))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: issueUrl })).toHaveAttribute("href", issueUrl);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("disables the submit button while the request is pending", async () => {
    let resolve!: (r: Response) => void;
    fetchMock.mockImplementation(() => new Promise<Response>((r) => (resolve = r)));
    renderAt("/articles");

    fireEvent.change(field(), { target: { value: "Slow" } });
    fireEvent.click(submitButton());

    await waitFor(() => expect(submitButton()).toBeDisabled());
    resolve(await respond(201, { issueNumber: 1, issueUrl }));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it("shows the rate-limit message on a 429 and keeps the text", async () => {
    fetchMock.mockImplementation(() => respond(429));
    renderAt("/articles");

    fireEvent.change(field(), { target: { value: "Too much" } });
    fireEvent.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      MESSAGES.ERROR.FEEDBACK_RATE_LIMITED,
    );
    expect(field()).toHaveValue("Too much");
    expect(toast.success).not.toHaveBeenCalled();
  });

  it.each([400, 502, 503])("shows the generic failure on a %i and keeps the text", async (status) => {
    fetchMock.mockImplementation(() =>
      respond(status, status === 400 ? { message: ["message should not be empty"] } : undefined),
    );
    renderAt("/articles");

    fireEvent.change(field(), { target: { value: "Broken" } });
    fireEvent.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(MESSAGES.ERROR.FEEDBACK_FAILED);
    expect(field()).toHaveValue("Broken");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("drops a failed send's error when the dialog closes, and keeps the text", async () => {
    fetchMock.mockImplementation(() => respond(429));
    renderAt("/articles");

    fireEvent.change(field(), { target: { value: "Too much" } });
    fireEvent.click(submitButton());
    await screen.findByRole("alert");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(field()).toHaveValue("Too much");
  });
});
