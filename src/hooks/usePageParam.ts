import { useCallback } from "react";
import { useSearchParams } from "react-router";

/**
 * A list's page number, kept in the URL so Back returns to the page the user
 * came from. Page 1 is the absent default, so the first page has a clean URL.
 *
 * `setPage` pushes a history entry, which is what a user clicking through
 * pages expects. Pass `{ replace: true }` for a correction the user should
 * not be able to step Back into, such as clamping past the last page.
 */
export function usePageParam() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);

  const setPage = useCallback(
    (next: number, { replace = false }: { replace?: boolean } = {}) => {
      setParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          if (next === 1) updated.delete("page");
          else updated.set("page", String(next));
          return updated;
        },
        { replace },
      );
    },
    [setParams],
  );

  return { page, setPage };
}
