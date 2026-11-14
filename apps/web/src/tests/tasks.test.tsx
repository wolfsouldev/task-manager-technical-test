import { AnimateUIProvider } from "@animate-ui/react/provider";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { vi, beforeEach, it, expect } from "vitest";
import { api, type Task, type User } from "@/services/api";
import { StatusControl } from "@/features/tasks/status";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/features/tasks/task-list";
import { TaskForm } from "@/features/tasks/task-form";
import { useChangeTaskStatus, taskKey } from "@/features/tasks/hooks";
import type { ReactNode } from "react";
vi.mock("@/services/api", async (original) => ({
  ...(await original<typeof import("@/services/api")>()),
  api: {
    tasks: vi.fn(),
    users: vi.fn(),
    createTask: vi.fn(),
    changeStatus: vi.fn(),
  },
}));
const person: User = {
  id: 1,
  name: "Ana García",
  email: "ana@example.test",
  createdAt: "2026-11-14T00:00:00.000Z",
  updatedAt: "2026-11-14T00:00:00.000Z",
};
const tasks: Task[] = [
  {
    id: 1,
    title: "Preparar API",
    description: "",
    status: "pending",
    assigneeId: 1,
    assignee: person,
    createdAt: person.createdAt,
    updatedAt: person.updatedAt,
  },
  {
    id: 2,
    title: "Diseño terminado",
    description: "",
    status: "done",
    assigneeId: 1,
    assignee: person,
    createdAt: person.createdAt,
    updatedAt: person.updatedAt,
  },
];
function mount(
  children: ReactNode,
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  }),
) {
  return {
    client,
    ...render(
      <QueryClientProvider client={client}>
        <AnimateUIProvider reducedMotion="always">
          <MemoryRouter>{children}</MemoryRouter>
        </AnimateUIProvider>
      </QueryClientProvider>,
    ),
  };
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.users).mockResolvedValue([person]);
  vi.mocked(api.tasks).mockImplementation(async (status) =>
    status ? tasks.filter((t) => t.status === status) : tasks,
  );
});

it("lista y envía el filtro a la API con una query independiente", async () => {
  const user = userEvent.setup();
  mount(<TaskList />);
  expect(await screen.findByText("Diseño terminado")).toBeVisible();
  const filter = screen.getByRole("combobox", { name: "Filtrar por estado" });
  expect(filter.tagName).toBe("BUTTON");
  await user.click(filter);
  await user.click(await screen.findByRole("option", { name: "Pendiente" }));
  expect(await screen.findByText("Preparar API")).toBeVisible();
  await waitFor(() =>
    expect(screen.queryByText("Diseño terminado")).not.toBeInTheDocument(),
  );
  expect(api.tasks).toHaveBeenCalledWith("pending");
});
it("valida con Zod y crea con responsable y estado del selector compartido con iconos", async () => {
  const user = userEvent.setup();
  const success = vi.fn();
  vi.mocked(api.createTask).mockResolvedValue({
    ...tasks[0],
    title: "Escribir documentación",
    status: "done",
  });
  mount(<TaskForm onSuccess={success} />);
  const submit = await screen.findByRole("button", { name: "Crear tarea" });
  await user.click(submit);
  expect(
    await screen.findByText("Escribe al menos 3 caracteres"),
  ).toBeVisible();
  expect(api.createTask).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText("Título"), "Escribir documentación");
  await user.click(screen.getByLabelText("Responsable"));
  await user.click(await screen.findByRole("option", { name: "Ana García" }));
  await waitFor(() =>
    expect(document.body).not.toHaveStyle({ pointerEvents: "none" }),
  );
  const status = screen.getByRole("combobox", { name: "Estado inicial" });
  expect(status.querySelector("svg.status-pending")).toHaveAttribute("aria-hidden", "true");
  await user.click(status);
  const menu = await screen.findByRole("listbox");
  for (const [value, label] of [
    ["pending", "Pendiente"],
    ["in_progress", "En curso"],
    ["done", "Hecha"],
  ]) {
    expect(
      within(menu).getByRole("option", { name: label }).querySelector(`svg.status-${value}`),
    ).toHaveAttribute("aria-hidden", "true");
  }
  await user.click(within(menu).getByRole("option", { name: "Hecha" }));
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  expect(status).toHaveTextContent("Hecha");
  expect(status.querySelector("svg.status-done")).toBeInTheDocument();
  expect(api.createTask).not.toHaveBeenCalled();
  expect(api.changeStatus).not.toHaveBeenCalled();
  await user.click(submit);
  await waitFor(() =>
    expect(api.createTask).toHaveBeenCalledWith(
      {
        title: "Escribir documentación",
        description: "",
        status: "done",
        assigneeId: 1,
      },
      expect.anything(),
    ),
  );
  await waitFor(() => expect(success).toHaveBeenCalled());
});
it("muestra error de carga y permite reintentar", async () => {
  vi.mocked(api.tasks).mockRejectedValueOnce(
    new Error("Servidor no disponible"),
  );
  const user = userEvent.setup();
  mount(<TaskList />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Servidor no disponible",
  );
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("Preparar API")).toBeVisible();
});
it("revierte la caché optimista cuando el cambio de estado falla", async () => {
  let reject!: (error: Error) => void;
  vi.mocked(api.changeStatus).mockImplementation(
    () =>
      new Promise((_resolve, rejectPromise) => {
        reject = rejectPromise;
      }),
  );
  function Control() {
    const mutation = useChangeTaskStatus();
    return (
      <button onClick={() => void mutation.change(tasks[0], "done")}>
        Mover tarea
      </button>
    );
  }
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  client.setQueryData(taskKey(), tasks);
  const user = userEvent.setup();
  mount(<Control />, client);
  await user.click(screen.getByRole("button"));
  await waitFor(() =>
    expect(client.getQueryData<Task[]>(taskKey())?.[0].status).toBe("done"),
  );
  reject(new Error("No se pudo guardar"));
  await waitFor(() =>
    expect(client.getQueryData<Task[]>(taskKey())?.[0].status).toBe("pending"),
  );
});
