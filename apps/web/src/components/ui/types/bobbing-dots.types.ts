import type { ComponentProps } from "react";

export type BobbingDotsProps = Omit<ComponentProps<"span">, "children"> & {
  dots?: number;
  duration?: number;
  label?: string;
};
