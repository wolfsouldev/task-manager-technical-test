import type { SelectTrigger } from "@/components/ui/select";
import type { Status } from "@/features/tasks/types/task.types";
import type { ComponentProps } from "react";

export type StatusIconProps = { status: Status };

export type StatusControlProps = {
  value: Status;
  onChange: (status: Status) => void;
  disabled?: boolean;
  title?: string;
} & Pick<ComponentProps<typeof SelectTrigger>, "id" | "ref" | "onBlur">;
