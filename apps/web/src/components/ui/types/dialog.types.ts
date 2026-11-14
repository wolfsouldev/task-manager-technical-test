import type { Dialog as DialogPrimitive } from "@animate-ui/react/primitives/radix-ui";
import type * as React from "react";

export type DialogContentProps = React.ComponentProps<
  typeof DialogPrimitive.Content
> & {
  showCloseButton?: boolean;
};

export type DialogFooterProps = React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
};
