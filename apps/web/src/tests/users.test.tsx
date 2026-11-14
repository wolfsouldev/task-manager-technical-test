import { AnimateUIProvider } from "@animate-ui/react/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig } from "motion/react";
import { beforeEach, expect, it, vi } from "vitest";
import { UsersPage } from "@/features/users/users-page";
import { api, ApiError, type User } from "@/services/api";

vi.mock("@/services/api", async (original) => ({
  ...(await original<typeof import("@/services/api")>()),
  api: {
    users: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

const people: User[] = [
  {
    id: 1,
    name: "Ana García de los Santos",
    email: "ana.garcia.responsable@example.test",
    createdAt: "2026-11-14T12:00:00.000Z",
    updatedAt: "2026-11-14T12:00:00.000Z",
  },
  {
    id: 2,
    name: "Carlos Pérez",
    email: "carlos@example.test",
    createdAt: "2026-11-13T12:00:00.000Z",
    updatedAt: "2026-11-13T12:00:00.000Z",
  },
];

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
        {/* JSDOM does not paint WAAPI frames; real motion is checked in Chromium. */}
        <MotionConfig skipAnimations>
          <UsersPage />
        </MotionConfig>
      </AnimateUIProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.users).mockResolvedValue(people);
});

it("muestra los datos completos y busca por nombre sin tildes o correo", async () => {
  const user = userEvent.setup();
  mount();
  const table = await screen.findByRole("table");
  for (const name of [
    "Nombre",
    "Correo electrónico",
    "Fecha de alta",
    "Acciones",
  ]) {
    expect(within(table).getByRole("columnheader", { name })).toBeVisible();
  }
  expect(
    within(table).getByRole("rowheader", { name: people[0].name }),
  ).toBeVisible();
  expect(within(table).getByText(people[0].email)).toBeVisible();
  expect(
    within(table).getByRole("button", { name: `Editar a ${people[0].name}` }),
  ).toHaveTextContent("Editar");
  expect(
    within(table).getByRole("button", { name: `Eliminar a ${people[0].name}` }),
  ).toHaveTextContent("Eliminar");
  const search = screen.getByRole("searchbox", {
    name: "Buscar usuarios por nombre o correo",
  });
  await user.type(search, "GARCIA");
  expect(screen.getByRole("status")).toHaveTextContent("1 de 2 usuarios");
  expect(screen.queryByText("Carlos Pérez")).not.toBeInTheDocument();
  await user.clear(search);
  await user.type(search, "CARLOS@EXAMPLE.TEST");
  expect(screen.getByRole("rowheader", { name: "Carlos Pérez" })).toBeVisible();
  await user.clear(search);
  await user.type(search, "no existe");
  expect(screen.getByText("No encontramos ese usuario")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
  expect(screen.getByRole("status")).toHaveTextContent("2 usuarios");
  expect(screen.getAllByRole("rowheader")).toHaveLength(2);
  expect(api.users).toHaveBeenCalledTimes(1);
});



it("valida el alta y conserva los campos si el servidor rechaza un correo duplicado", async () => {
  const user = userEvent.setup();
  vi.mocked(api.createUser).mockRejectedValue(
    new ApiError("Este correo ya está en uso", 409, {
      email: "Este correo ya está en uso",
    }),
  );
  mount();
  await user.click(screen.getByRole("button", { name: "Nuevo usuario" }));
  const dialog = await screen.findByRole("dialog", { name: "Nuevo usuario" });
  await waitFor(() => expect(dialog).toBeVisible());
  await user.click(
    within(dialog).getByRole("button", { name: "Crear usuario" }),
  );
  await waitFor(() =>
    expect(
      within(dialog).getByText("Escribe al menos 2 caracteres"),
    ).toBeVisible(),
  );
  expect(api.createUser).not.toHaveBeenCalled();
  await user.type(
    within(dialog).getByRole("textbox", { name: "Nombre" }),
    "Nueva Persona",
  );
  const email = within(dialog).getByRole("textbox", {
    name: "Correo electrónico",
  });
  await user.type(email, " ANA@EXAMPLE.TEST ");
  await user.click(
    within(dialog).getByRole("button", { name: "Crear usuario" }),
  );
  await waitFor(() =>
    expect(api.createUser).toHaveBeenCalledWith({
      name: "Nueva Persona",
      email: "ana@example.test",
    }),
  );
  await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));
  expect(email).toHaveValue("ANA@EXAMPLE.TEST");
  expect(within(dialog).getByRole("textbox", { name: "Nombre" })).toHaveValue(
    "Nueva Persona",
  );
  expect(email).toHaveAccessibleDescription("Este correo ya está en uso");
});

it("pide confirmar la eliminación y conserva al usuario ante un 409", async () => {
  const user = userEvent.setup();
  vi.mocked(api.deleteUser).mockRejectedValue(
    new ApiError("El usuario tiene tareas asignadas", 409),
  );
  mount();
  await user.click(
    await screen.findByRole("button", { name: "Eliminar a Carlos Pérez" }),
  );
  const dialog = await screen.findByRole("alertdialog", {
    name: "¿Eliminar a Carlos Pérez?",
  });
  expect(api.deleteUser).not.toHaveBeenCalled();
  await user.click(
    within(dialog).getByRole("button", { name: "Eliminar usuario" }),
  );
  expect(await within(dialog).findByRole("alert")).toHaveTextContent(
    "El usuario tiene tareas asignadas",
  );
  expect(api.deleteUser).toHaveBeenCalledWith(2, expect.anything());
  await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));
  expect(
    await screen.findByRole("rowheader", { name: "Carlos Pérez" }),
  ).toBeVisible();
});
