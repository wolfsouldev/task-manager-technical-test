export type Page<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalAll: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
