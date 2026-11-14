import type { Button as AnimateButton } from "@animate-ui/react/primitives/buttons/button";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";
import type { buttonVariants } from "../variants/button.variants";

export type ButtonProps = Omit<
  React.ComponentProps<typeof AnimateButton>,
  "asChild"
> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };
