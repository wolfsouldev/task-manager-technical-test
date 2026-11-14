import { cn } from "@/lib/utils";
import { Button as AnimateButton } from "@animate-ui/react/primitives/buttons/button";
import * as React from "react";
import type { ButtonProps } from "./types/button.types";
import { buttonVariants } from "./variants/button.variants";

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const shared = {
    type,
    "data-slot": "button",
    "data-variant": variant,
    "data-size": size,
    className: cn(buttonVariants({ variant, size, className })),
    ...props,
  };
  // Animate UI discriminates asChild: true and requires exactly one element.
  // Keep the shadcn boolean API, narrowing it before passing to the primitive.
  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error("Button asChild necesita un único elemento React");
    }
    return (
      <AnimateButton {...shared} asChild>
        {children}
      </AnimateButton>
    );
  }
  return (
    <AnimateButton {...shared} asChild={false}>
      {children}
    </AnimateButton>
  );
}

export { Button, buttonVariants };
