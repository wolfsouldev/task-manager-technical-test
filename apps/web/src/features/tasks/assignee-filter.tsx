import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUsersPage } from "@/features/users/hooks";
import type { User } from "@/features/users/types/user.types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { api } from "@/services/api";
import { Popover } from "@animate-ui/react/primitives/radix-ui/popover";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  UserRound,
} from "lucide-react";
import { useId, useRef, useState } from "react";
import type { AssigneeFilterProps } from "./types/assignee-filter.types";

export function AssigneeFilter({ value, onChange }: AssigneeFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search.trim(), 300);
  const [paging, setPaging] = useState({ q: "", page: 1 });
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const client = useQueryClient();
  const selected = useQuery({
    queryKey: ["users", "detail", value],
    queryFn: ({ signal }) => api.user(value!, signal),
    enabled: value !== undefined,
    retry: false,
  });
  const users = useUsersPage(
    { page: paging.q === q ? paging.page : 1, limit: 5, q },
    open,
  );
  const busy = users.isFetching || search.trim() !== q;
  const items = users.data?.items ?? [];
  const choices: (User | undefined)[] = [undefined, ...items];
  const index = Math.min(active, choices.length - 1);
  function choose(user?: User) {
    if (user) client.setQueryData(["users", "detail", user.id], user);
    onChange(user?.id);
    setOpen(false);
  }
  function page(number: number) {
    setPaging({ q, page: number });
    setActive(1);
    input.current?.focus();
  }
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          className="assignee-filter"
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Filtrar por responsable"
        >
          <UserRound size={15} aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">
            {value === undefined
              ? "Todos los responsables"
              : (selected.data?.name ??
                (selected.isPending
                  ? "Cargando responsable…"
                  : "Responsable no disponible"))}
          </span>
          <ChevronDown size={14} aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="assignee-picker-popup"
          align="end"
          sideOffset={6}
          collisionPadding={16}
          aria-label="Buscar y seleccionar responsable"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            input.current?.focus();
          }}
        >
          <div className="assignee-picker-search">
            <Search size={16} aria-hidden="true" />
            <Input
              ref={input}
              value={search}
              maxLength={100}
              placeholder="Buscar nombre o correo…"
              aria-label="Buscar responsables por nombre o correo"
              role="combobox"
              aria-expanded="true"
              aria-autocomplete="list"
              aria-controls={listId}
              aria-activedescendant={!busy ? `${listId}-${index}` : undefined}
              onChange={(event) => {
                setSearch(event.target.value);
                setActive(event.target.value.trim() ? 1 : 0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive(
                    (index +
                      (event.key === "ArrowDown" ? 1 : choices.length - 1)) %
                      choices.length,
                  );
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  if (!busy) choose(choices[index]);
                }
              }}
            />
          </div>
          <div
            id={listId}
            role="listbox"
            aria-label="Responsables disponibles"
            aria-busy={busy}
            className="assignee-picker-results"
          >
            <button
              type="button"
              role="option"
              id={`${listId}-0`}
              aria-selected={value === undefined}
              tabIndex={-1}
              data-active={index === 0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose()}
            >
              <span>Todos los responsables</span>
              {value === undefined && <Check size={16} aria-hidden="true" />}
            </button>
            {!busy &&
              !users.isError &&
              items.map((user, offset) => (
                <button
                  type="button"
                  key={user.id}
                  id={`${listId}-${offset + 1}`}
                  role="option"
                  aria-selected={user.id === value}
                  tabIndex={-1}
                  data-active={index === offset + 1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(user)}
                >
                  <span>
                    <span className="assignee-option-name">{user.name}</span>
                    <span className="assignee-option-email">{user.email}</span>
                  </span>
                  {user.id === value && <Check size={16} aria-hidden="true" />}
                </button>
              ))}
          </div>
          {busy ? (
            <p className="assignee-picker-message" role="status">
              Buscando responsables…
            </p>
          ) : users.isError ? (
            <div className="assignee-picker-message" role="alert">
              No se pudieron cargar los usuarios.{" "}
              <Button variant="link" onClick={() => void users.refetch()}>
                Reintentar
              </Button>
            </div>
          ) : !items.length ? (
            <p className="assignee-picker-message" role="status">
              No hay usuarios con esa búsqueda.
            </p>
          ) : null}
          {users.data && (
            <div className="assignee-picker-pagination">
              <span aria-live="polite">
                Página {users.data.page} de {users.data.totalPages} ·{" "}
                {users.data.total} usuarios
              </span>
              <div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Página anterior de responsables"
                  disabled={busy || !users.data.hasPreviousPage}
                  onClick={() => page(users.data!.page - 1)}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Página siguiente de responsables"
                  disabled={busy || !users.data.hasNextPage}
                  onClick={() => page(users.data!.page + 1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
