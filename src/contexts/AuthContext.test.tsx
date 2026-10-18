import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";

function LogoutButton() {
  const { logout } = useAuth();
  return <button onClick={logout}>logout</button>;
}

beforeEach(() => {
  localStorage.clear();
});

describe("logout", () => {
  it("clears the query cache so the next login in the same tab does not see the previous user's data", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["bookmarks"], [{ id: "b1" }]);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LogoutButton />
        </AuthProvider>
      </QueryClientProvider>,
    );

    await act(async () => {
      (await screen.findByRole("button", { name: "logout" })).click();
    });

    expect(queryClient.getQueryData(["bookmarks"])).toBeUndefined();
  });
});
