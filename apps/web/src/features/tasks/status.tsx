import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statuses } from "@/features/tasks/constants/task-status.constants";
import type { Status } from "@/features/tasks/types/task.types";
import { Circle, CircleCheck, CircleDashed, CircleDot } from "lucide-react";
import type { StatusControlProps, StatusIconProps } from "./types/status.types";

export const statusLabels: Record<Status, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  done: "Hecha",
};
const icons = {
  pending: CircleDashed,
  in_progress: CircleDot,
  done: CircleCheck,
};
export function StatusIcon({ status }: StatusIconProps) {
  const Icon = icons[status] ?? Circle;
  return <Icon size={16} className={`status-${status}`} aria-hidden="true" />;
}
export function StatusControl({
  value,
  onChange,
  disabled,
  title,
  id,
  ref,
  onBlur,
}: StatusControlProps) {
  return (
    <Select
      value={value}
      onValueChange={(status) => onChange(status as Status)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        ref={ref}
        onBlur={onBlur}
        className="status-picker"
        data-status={value}
        aria-label={title ? `Estado de ${title}` : undefined}
      >
        <SelectValue>
          <StatusIcon status={value} />
          <span>{statusLabels[value]}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="status-menu" align="start">
        <SelectGroup>
          <SelectLabel>Cambiar estado</SelectLabel>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              <StatusIcon status={status} />
              {statusLabels[status]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
