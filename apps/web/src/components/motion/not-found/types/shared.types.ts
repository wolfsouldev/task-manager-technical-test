import type * as React from "react";
import type { notFoundMessages } from "../constants/not-found.constants";

export interface NotFoundProps {
  className?: string;
  /** The big status code. */
  code?: string;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  browseHref?: string;
  browseLabel?: string;
  /** Override any built-in string. Explicit `title`, `description`, `homeLabel` and `browseLabel` props still win. */
  labels?: Partial<NotFoundMessages>;
}

export type NotFoundMessages = typeof notFoundMessages;

export type ActionsProps = Pick<
  NotFoundProps,
  | "homeHref"
  | "homeLabel"
  | "browseHref"
  | "browseLabel"
  | "labels"
  | "className"
>;

export type NotFoundStageProps = {
  className?: string;
  children: React.ReactNode;
};
