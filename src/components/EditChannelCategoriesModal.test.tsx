import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EditChannelCategoriesModal from "./EditChannelCategoriesModal";

vi.stubGlobal(
  "fetch",
  vi.fn(async () => ({ ok: true, status: 200, json: async () => [] }) as unknown as Response),
);

const tech = { id: "cat-1", name: "tech", color: "#3b82f6" };
const travel = { id: "cat-2", name: "travel", color: "#10b981" };

describe("EditChannelCategoriesModal", () => {
  it("shows the categories of the channel it is reopened on", () => {
    const queryClient = new QueryClient();
    const renderFor = (channel: { id: string; name: string; categories: typeof tech[] } | null) => (
      <QueryClientProvider client={queryClient}>
        <EditChannelCategoriesModal channel={channel} onOpenChange={() => {}} />
      </QueryClientProvider>
    );

    const { rerender } = render(renderFor({ id: "ch-1", name: "One", categories: [tech] }));
    rerender(renderFor(null));
    rerender(renderFor({ id: "ch-2", name: "Two", categories: [travel] }));

    expect(screen.getByRole("button", { name: "Remove travel" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove tech" })).not.toBeInTheDocument();
  });
});
