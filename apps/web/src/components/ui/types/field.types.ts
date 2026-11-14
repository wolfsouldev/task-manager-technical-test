import type { VariantProps } from "class-variance-authority";
import type * as React from "react";
import type { fieldVariants } from "../variants/field.variants";

export type FieldLegendProps = React.ComponentProps<"legend"> & {
  variant?: "legend" | "label";
};

export type FieldSeparatorProps = React.ComponentProps<"div"> & {
  children?: React.ReactNode;
};

export type FieldErrorProps = React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
};

export type FieldProps = React.ComponentProps<"div"> &
  VariantProps<typeof fieldVariants>;
