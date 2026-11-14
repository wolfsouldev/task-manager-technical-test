import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TaskDialog } from "@/features/tasks/task-dialog";
import { ChevronRight, Columns3, List, Plus } from "lucide-react";
import { useState } from "react";
import { Link, matchPath, Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { ThemeButton } from "./theme-button";

export function AppShell() {
  const [creating, setCreating] = useState(false);
  const location = useLocation();
  const path = location.pathname;
  const isBoardView = Boolean(matchPath("/", path));
  const isListView = Boolean(matchPath("/tasks", path));
  const isTaskView = isBoardView || isListView;
  const isUsersView = Boolean(matchPath("/users", path));
  const title = isUsersView
    ? "Usuarios"
    : isTaskView
      ? "Tareas"
      : "Página no encontrada";
  function viewLink(target: "/" | "/tasks") {
    if ((target === "/" && isBoardView) || (target === "/tasks" && isListView))
      return target + location.search;
    const assigneeId = new URLSearchParams(location.search).get("assigneeId");
    return (
      target +
      (assigneeId ? `?assigneeId=${encodeURIComponent(assigneeId)}` : "")
    );
  }
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "232px" } as React.CSSProperties}
    >
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="app-topbar">
          <div className="breadcrumb">
            <SidebarTrigger aria-label="Abrir o cerrar navegación" />
            <span className="breadcrumb-workspace">Espacio de trabajo</span>
            <ChevronRight size={14} />
            <span>{title}</span>
          </div>
          <ThemeButton />
        </header>
        <div id="main" tabIndex={-1} className="main-content">
          {(isTaskView || isUsersView) && (
            <div className="page-heading">
              <div>
                <div className="page-eyebrow">Tu trabajo, en orden</div>
                <h1>{title}</h1>
              </div>
              {isTaskView && (
                <Button onClick={() => setCreating(true)}>
                  <Plus size={16} />
                  Nueva tarea
                </Button>
              )}
            </div>
          )}
          {isTaskView && (
            <nav className="view-tabs" aria-label="Vista de tareas">
              <Link
                className={isBoardView ? "active" : ""}
                to={viewLink("/")}
                aria-current={isBoardView ? "page" : undefined}
              >
                <Columns3 size={15} />
                Tablero
              </Link>
              <Link
                className={isListView ? "active" : ""}
                to={viewLink("/tasks")}
                aria-current={isListView ? "page" : undefined}
              >
                <List size={15} />
                Lista
              </Link>
            </nav>
          )}
          <Outlet />
        </div>
      </SidebarInset>
      <TaskDialog open={creating} onClose={() => setCreating(false)} />
    </SidebarProvider>
  );
}
