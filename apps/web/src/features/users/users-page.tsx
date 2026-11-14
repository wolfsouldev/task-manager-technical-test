import { Avatar, LoadError, Loading } from "@/components/feedback";
import { Pagination } from "@/components/pagination";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { User } from "@/features/users/types/user.types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUsersPage } from "./hooks";
import { UserForm } from "./user-form";

const dateFormatter = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
export function UsersPage() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search.trim(), 300);
  const [paging, setPaging] = useState({ page: 1, limit: 10, q: "" });
  const page = paging.q === query ? paging.page : 1;
  const users = useUsersPage({ page, limit: paging.limit, q: query });
  const [editing, setEditing] = useState<User | "new" | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const visibleUsers = users.data?.items ?? [];
  const remove = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario eliminado");
      setDeleting(null);
    },
  });
  return (
    <>
      <div className="view-toolbar users-toolbar">
        <p className="view-description">
          Gestiona las personas responsables de tus tareas.
        </p>
        <Button onClick={() => setEditing("new")}>
          <Plus size={16} />
          Nuevo usuario
        </Button>
      </div>
      <section
        className="users-directory"
        aria-labelledby="users-directory-title"
        aria-busy={users.isFetching || search.trim() !== query}
      >
        <div className="users-directory-header">
          <div className="users-directory-title">
            <h2 id="users-directory-title">Directorio de usuarios</h2>
            <p id="users-results" role={users.data ? "status" : undefined}>
              {users.data
                ? query
                  ? `${users.data.total} de ${users.data.totalAll} usuarios`
                  : `${users.data.total} ${users.data.total === 1 ? "usuario" : "usuarios"}`
                : "Cargando usuarios…"}
            </p>
          </div>
          <div className="users-search">
            <label htmlFor="users-search" className="sr-only">
              Buscar usuarios por nombre o correo
            </label>
            <Search size={17} aria-hidden="true" />
            <Input
              id="users-search"
              type="search"
              maxLength={100}
              placeholder="Buscar por nombre o correo…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-describedby="users-results"
            />
          </div>
        </div>
        {users.isPending ? (
          <Loading />
        ) : users.isError ? (
          <LoadError error={users.error} retry={() => void users.refetch()} />
        ) : visibleUsers.length ? (
          <table className="users-table" role="table">
            <caption className="sr-only">
              Usuarios asignables, correo electrónico, fecha de alta y acciones
            </caption>
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">
                  Nombre
                </th>
                <th scope="col" role="columnheader">
                  Correo electrónico
                </th>
                <th scope="col" role="columnheader">
                  Fecha de alta
                </th>
                <th scope="col" role="columnheader">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {visibleUsers.map((user) => (
                <tr className="user-row" key={user.id} role="row">
                  <th
                    scope="row"
                    role="rowheader"
                    className="user-identity-cell"
                  >
                    <div className="user-identity">
                      <span aria-hidden="true">
                        <Avatar name={user.name} id={user.id} />
                      </span>
                      <span className="user-name">{user.name}</span>
                    </div>
                  </th>
                  <td role="cell" className="user-email-cell">
                    <span className="user-cell-label" aria-hidden="true">
                      Correo electrónico
                    </span>
                    <span className="user-email">{user.email}</span>
                  </td>
                  <td role="cell" className="user-date-cell">
                    <span className="user-cell-label" aria-hidden="true">
                      Fecha de alta
                    </span>
                    <time dateTime={user.createdAt}>
                      {dateFormatter.format(new Date(user.createdAt))}
                    </time>
                  </td>
                  <td role="cell" className="user-actions-cell">
                    <div className="user-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Editar a ${user.name}`}
                        onClick={() => setEditing(user)}
                      >
                        <Pencil size={15} aria-hidden="true" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="user-delete"
                        aria-label={`Eliminar a ${user.name}`}
                        onClick={() => {
                          remove.reset();
                          setDeleting(user);
                        }}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="users-empty">
            <span className="users-empty-icon">
              <Users size={25} aria-hidden="true" />
            </span>
            <h3>
              {query
                ? "No encontramos ese usuario"
                : "Tu primer responsable empieza aquí"}
            </h3>
            <p>
              {query
                ? "Prueba con otro nombre o correo electrónico."
                : "Crea un usuario para poder asignarle tareas."}
            </p>
            <Button
              variant="outline"
              onClick={() => (query ? setSearch("") : setEditing("new"))}
            >
              {query ? "Limpiar búsqueda" : "Crear primer usuario"}
            </Button>
          </div>
        )}
        {users.data && !users.isError && (
          <Pagination
            data={users.data}
            limit={paging.limit}
            label="Usuarios"
            pending={users.isFetching || search.trim() !== query}
            onPage={(value) => setPaging({ ...paging, page: value, q: query })}
            onLimit={(value) => setPaging({ page: 1, limit: value, q: query })}
          />
        )}
        <p className="users-directory-note">
          <Info size={15} aria-hidden="true" />
          Los usuarios con tareas asignadas no se pueden eliminar.
        </p>
      </section>
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing === "new" ? "Nuevo usuario" : "Editar usuario"}
            </DialogTitle>
            <DialogDescription>
              Podrás asignarle tareas desde el tablero o la lista.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <UserForm
              key={editing === "new" ? "new" : editing.id}
              user={editing === "new" ? undefined : editing}
              onSuccess={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && !remove.isPending && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Si tiene tareas asignadas, no se
              eliminará.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {remove.error && (
            <p role="alert" className="form-error">
              {remove.error.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => deleting && remove.mutate(deleting.id)}
            >
              {remove.isPending ? "Eliminando…" : "Eliminar usuario"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
