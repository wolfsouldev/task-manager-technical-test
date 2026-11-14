import { Loading } from "@/components/feedback";
import { AppShell } from "@/components/layout/app-shell";
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const TaskList = lazy(() =>
  import("@/features/tasks/task-list").then((m) => ({ default: m.TaskList })),
);
const UsersPage = lazy(() =>
  import("@/features/users/users-page").then((m) => ({ default: m.UsersPage })),
);
const Board = lazy(() =>
  import("@/features/kanban/board").then((m) => ({ default: m.Board })),
);
const NotFoundPage = lazy(() =>
  import("@/features/not-found/not-found-page").then((m) => ({
    default: m.NotFoundPage,
  })),
);
export function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Board />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
