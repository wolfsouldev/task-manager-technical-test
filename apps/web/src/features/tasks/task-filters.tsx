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
import { Layers3, ListFilter } from "lucide-react";
import { AssigneeFilter } from "./assignee-filter";
import { StatusIcon, statusLabels } from "./status";
import type { TaskFiltersProps } from "./types/task-filters.types";

export function assigneeParam(value: string | null) {
  const id = value && /^\d+$/.test(value) ? Number(value) : undefined;
  return id && Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

export function TaskFilters({
  status,
  assigneeId,
  onChange,
  includeStatus = true,
}: TaskFiltersProps) {
  return (
    <div className="task-filters">
      {includeStatus && (
        <Select
          value={status ?? "all"}
          onValueChange={(value) =>
            onChange({
              status: value === "all" ? undefined : (value as Status),
            })
          }
        >
          <SelectTrigger
            className="filter-picker"
            aria-label="Filtrar por estado"
          >
            <ListFilter size={15} />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              <SelectLabel>Mostrar tareas</SelectLabel>
              <SelectItem value="all">
                <Layers3 size={15} />
                Todas
              </SelectItem>
              {statuses.map((value) => (
                <SelectItem key={value} value={value}>
                  <StatusIcon status={value} />
                  {statusLabels[value]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      <AssigneeFilter
        value={assigneeId}
        onChange={(id) => onChange({ assigneeId: id })}
      />
    </div>
  );
}
