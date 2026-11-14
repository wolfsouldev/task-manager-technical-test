import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationProps } from "./types/pagination.types";

export function Pagination({
  data,
  limit,
  onPage,
  onLimit,
  pending,
  label,
}: PaginationProps) {
  const pages = [
    ...new Set([1, data.page - 1, data.page, data.page + 1, data.totalPages]),
  ]
    .filter((page) => page >= 1 && page <= data.totalPages)
    .sort((a, b) => a - b);
  const first = data.total ? (data.page - 1) * data.limit + 1 : 0;
  const last = Math.min(data.page * data.limit, data.total);
  return (
    <nav
      className="pagination"
      aria-label={`Paginación de ${label.toLowerCase()}`}
      aria-busy={pending}
    >
      <div className="pagination-summary">
        <p aria-live="polite">
          Mostrando {first}–{last} de {data.total}
        </p>
        <div className="pagination-size">
          <label htmlFor={`page-size-${label}`}>{label} por página</label>
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimit(Number(value))}
            disabled={pending}
          >
            <SelectTrigger id={`page-size-${label}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="pagination-controls">
        <Button
          variant="outline"
          className="h-11"
          disabled={pending || !data.hasPreviousPage}
          onClick={() => onPage(data.page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft aria-hidden="true" />
          Anterior
        </Button>
        {pages.map((page, index) => (
          <span className="pagination-number" key={page}>
            {index > 0 && page - pages[index - 1] > 1 && (
              <span aria-hidden="true" className="pagination-ellipsis">
                …
              </span>
            )}
            <Button
              variant={page === data.page ? "secondary" : "ghost"}
              className="size-11"
              disabled={pending}
              aria-label={`Ir a página ${page}`}
              aria-current={page === data.page ? "page" : undefined}
              onClick={() => onPage(page)}
            >
              {page}
            </Button>
          </span>
        ))}
        <Button
          variant="outline"
          className="h-11"
          disabled={pending || !data.hasNextPage}
          onClick={() => onPage(data.page + 1)}
          aria-label="Página siguiente"
        >
          Siguiente
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
