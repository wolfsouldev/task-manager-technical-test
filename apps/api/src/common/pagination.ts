import type { PaginationQueryDto } from "./dto/pagination-query.dto";
import type { PageBounds, PaginatedResult } from "./types/pagination.types";

export function pageBounds(
  total: number,
  query: PaginationQueryDto,
): PageBounds {
  const limit = query.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(query.page ?? 1, totalPages);
  return { total, limit, totalPages, page, offset: (page - 1) * limit };
}

export function pageResult<T>(
  items: T[],
  bounds: PageBounds,
  totalAll = bounds.total,
): PaginatedResult<T> {
  const { offset: _offset, ...meta } = bounds;
  return {
    items,
    ...meta,
    totalAll,
    hasNextPage: meta.page < meta.totalPages,
    hasPreviousPage: meta.page > 1,
  };
}
