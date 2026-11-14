import { AnimateUIProvider } from "@animate-ui/react/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig } from "motion/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { TaskList } from "@/features/tasks/task-list";
import { DescriptionPreview } from "@/features/tasks/description-preview";
import {
  cleanDescription,
  descriptionText,
} from "@/features/tasks/description";
import { api, ApiError, type Task, type User } from "@/services/api";

vi.mock("@/services/api", async (original) => ({
  ...(await original<typeof import("@/services/api")>()),
  api: { tasks: vi.fn(), task: vi.fn(), users: vi.fn(), updateTask: vi.fn() },
}));
const date = "2026-11-14T12:00:00.000Z";
const people: User[] = [
  {
    id: 1,
    name: "Ana García",
    email: "ana@example.test",
    createdAt: date,
    updatedAt: date,
  },
  {
    id: 2,
    name: "Carlos Pérez",
    email: "carlos@example.test",
    createdAt: date,
    updatedAt: date,
  },
];
const task: Task = {
  id: 7,
  title: "Diseñar detalle de tarea",
  description:
    "<h2>Objetivo</h2><p>Contexto <strong>importante</strong> y completo.</p><ul><li><p>Primer paso</p></li></ul>",
  status: "pending",
  assigneeId: 1,
  assignee: people[0],
  createdAt: date,
  updatedAt: date,
};
function mount() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  render(
    <QueryClientProvider client={client}>
      <AnimateUIProvider reducedMotion="always">
        <MotionConfig skipAnimations>
          <MemoryRouter>
            <TaskList />
          </MemoryRouter>
        </MotionConfig>
      </AnimateUIProvider>
    </QueryClientProvider>,
  );
  return client;
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.tasks).mockResolvedValue([task]);
  vi.mocked(api.task).mockResolvedValue(task);
  vi.mocked(api.users).mockResolvedValue(people);
});
it("elimina HTML peligroso y genera una vista previa de texto sin etiquetas ni palabras pegadas", () => {
  const html =
    '<p onclick="alert(1)">Uno <strong>dos</strong><script>alert(1)</script><img src=x onerror="alert(1)"></p><ul><li>Tres</li><li>Cuatro</li></ul>';
  expect(cleanDescription(html)).toBe(
    "<p>Uno <strong>dos</strong></p><ul><li>Tres</li><li>Cuatro</li></ul>",
  );
  expect(descriptionText(html)).toBe("Uno dos Tres Cuatro");
  const { container } = render(
    <DescriptionPreview html={`<p>${"Texto largo ".repeat(100)}</p>`} />,
  );
  expect(container.textContent!.length).toBeLessThanOrEqual(241);
  expect(container.textContent).toMatch(/…$/);
  expect(container.querySelector("strong,script,img")).toBeNull();
});
it("abre el detalle, conserva el formato y permite reasignar y cambiar el estado con icono", async () => {
  const user = userEvent.setup();
  vi.mocked(api.updateTask).mockResolvedValue({
    ...task,
    title: "Título actualizado",
    assigneeId: 2,
    assignee: people[1],
    status: "in_progress",
  });
  mount();
  const open = await screen.findByRole("button", {
    name: `Abrir tarea: ${task.title}`,
  });
  expect(api.task).not.toHaveBeenCalled();
  await user.click(open);
  const dialog = await screen.findByRole("dialog");
  const name = await within(dialog).findByRole("textbox", { name: "Título" });
  expect(name).toHaveValue(task.title);
  const description = within(dialog).getByRole("textbox", {
    name: "Descripción",
  });
  expect(
    within(description).getByRole("heading", { name: "Objetivo" }),
  ).toBeInTheDocument();
  expect(within(description).getByText("importante").tagName).toBe("STRONG");
  expect(within(description).getByText("Primer paso")).toBeInTheDocument();
  expect(
    within(dialog).getByRole("button", { name: "Guardar cambios" }),
  ).toBeDisabled();
  await user.clear(name);
  await user.type(name, "Título actualizado");
  await user.click(
    within(dialog).getByRole("combobox", { name: "Responsable" }),
  );
  await user.click(await screen.findByRole("option", { name: "Carlos Pérez" }));
  await waitFor(() =>
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
  );
  const status = within(dialog).getByRole("combobox", { name: "Estado" });
  expect(status.querySelector("svg.status-pending")).toBeInTheDocument();
  await user.click(status);
  const inProgress = await screen.findByRole("option", { name: "En curso" });
  expect(inProgress.querySelector("svg.status-in_progress")).toBeInTheDocument();
  await user.click(inProgress);
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  expect(status).toHaveTextContent("En curso");
  expect(status.querySelector("svg.status-in_progress")).toBeInTheDocument();
  expect(api.updateTask).not.toHaveBeenCalled();
  await user.click(
    within(dialog).getByRole("button", { name: "Guardar cambios" }),
  );
  await waitFor(() =>
    expect(api.updateTask).toHaveBeenCalledWith({
      id: 7,
      title: "Título actualizado",
      description: task.description,
      assigneeId: 2,
      status: "in_progress",
    }),
  );
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(vi.mocked(api.tasks).mock.calls.length).toBeGreaterThan(1);
});
