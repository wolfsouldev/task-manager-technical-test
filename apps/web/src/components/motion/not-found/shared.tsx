"use client";

import {
  NOT_FOUND_DEFAULTS,
  notFoundMessages,
} from "./constants/not-found.constants";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import type {
  ActionsProps,
  NotFoundMessages,
  NotFoundStageProps,
} from "./types/shared.types";

export {
  NOT_FOUND_DEFAULTS,
  notFoundMessages,
} from "./constants/not-found.constants";
export type { NotFoundMessages, NotFoundProps } from "./types/shared.types";

/** Resolves a variant's strings: explicit props, then `labels`, the provider and English. */
export function useNotFoundMessages(labels?: Partial<NotFoundMessages>) {
  return useMessages("notFound", notFoundMessages, labels);
}

/** The shared dual CTA: a primary "Back home" and a secondary "Browse". */
export function NotFoundActions({
  homeHref = NOT_FOUND_DEFAULTS.homeHref,
  homeLabel,
  browseHref = NOT_FOUND_DEFAULTS.browseHref,
  browseLabel,
  labels,
  className,
}: ActionsProps) {
  const t = useNotFoundMessages(labels);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-3",
        className,
      )}
    >
      <Button asChild className="h-11 rounded-full px-6">
        <Link to={homeHref}>{homeLabel ?? t("homeLabel")}</Link>
      </Button>
      <Button asChild variant="outline" className="h-11 rounded-full px-6">
        <Link to={browseHref}>{browseLabel ?? t("browseLabel")}</Link>
      </Button>
    </div>
  );
}

/** Centers a variant and gives it a consistent minimum stage height. */
export function NotFoundStage({ className, children }: NotFoundStageProps) {
  return (
    <div
      className={cn(
        "flex min-h-[420px] w-full flex-col items-center justify-center gap-8 px-4 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
