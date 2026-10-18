import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import { BackButton } from "./BackButton";

function ListPage() {
  const { search } = useLocation();
  return <p>list{search}</p>;
}

describe("BackButton", () => {
  it("returns to the previous entry with its query string", () => {
    render(
      <MemoryRouter initialEntries={["/articles?feedSource=Will+Larson&page=3", "/articles/1"]} initialIndex={1}>
        <Routes>
          <Route path="/articles" element={<ListPage />} />
          <Route path="/articles/:id" element={<BackButton to="/articles" />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Back"));

    expect(screen.getByText("list?feedSource=Will+Larson&page=3")).toBeInTheDocument();
  });
});
