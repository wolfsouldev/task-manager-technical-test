import type { Select as SelectPrimitive } from "@animate-ui/react/primitives/radix-ui";
import type * as React from "react";

export type SelectTriggerProps = React.ComponentProps<
  typeof SelectPrimitive.Trigger
> & {
  size?: "sm" | "default";
};
