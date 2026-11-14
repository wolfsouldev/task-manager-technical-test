import { NotFoundGlitch } from "@/components/motion/not-found/glitch";

export function NotFoundPage() {
  return (
    <section aria-label="Página no encontrada">
      <NotFoundGlitch
        className="not-found-page"
        title="Página no encontrada"
        description="Esta dirección no existe o ha cambiado. Vuelve a tus tareas para continuar."
        homeHref="/"
        homeLabel="Volver a Tareas"
        browseHref="/tasks"
        browseLabel="Ver lista de tareas"
      />
    </section>
  );
}
