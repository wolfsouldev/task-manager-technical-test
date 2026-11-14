import type { Page } from "@/types/pagination.types";

export type PaginationProps = {
  data: Page<unknown>;
  limit: number;
  onPage: (page: number) => void;
  onLimit: (limit: number) => void;
  pending?: boolean;
  label: string;
};
