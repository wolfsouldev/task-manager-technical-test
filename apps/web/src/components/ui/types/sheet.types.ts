import type { Dialog as SheetPrimitive } from "@animate-ui/react/primitives/radix-ui";
import type * as React from "react";

export type SheetContentProps = React.ComponentProps<
  typeof SheetPrimitive.Content
> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
};
