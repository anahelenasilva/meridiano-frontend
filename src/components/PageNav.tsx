import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Fragment } from "react";

interface PageNavProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Previous, next, and a window of first, last and the pages around the
 * current one. Renders nothing for a single page.
 */
export default function PageNav({ page, totalPages, onPageChange }: PageNavProps) {
  if (totalPages <= 1) return null;

  const shown = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(page - 1)}
              className="cursor-pointer"
            />
          </PaginationItem>
        )}

        {shown.map((p, idx) => (
          <Fragment key={p}>
            {idx > 0 && shown[idx - 1] !== p - 1 && (
              <PaginationItem>
                <span className="px-2">...</span>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                onClick={() => onPageChange(p)}
                isActive={p === page}
                className="cursor-pointer"
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          </Fragment>
        ))}

        {page < totalPages && (
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(page + 1)}
              className="cursor-pointer"
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
