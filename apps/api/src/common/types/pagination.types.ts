export type PaginationWindow = { limit: number; offset: number };

export interface PageBounds {
  total: number;
  limit: number;
  totalPages: number;
  page: number;
  offset: number;
}
export type PaginatedResult<T> = Omit<PageBounds, "offset"> & {
  items: T[];
  totalAll: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
