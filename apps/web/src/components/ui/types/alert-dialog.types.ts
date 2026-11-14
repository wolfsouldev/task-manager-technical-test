import type { AlertDialog as AlertDialogPrimitive } from "@animate-ui/react/primitives/radix-ui";
import type * as React from "react";
import type { Button } from "../button";

export type AlertDialogContentProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Content
> & {
  size?: "default" | "sm";
};

export type AlertDialogActionProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Action
> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">;

export type AlertDialogCancelProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Cancel
> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">;
