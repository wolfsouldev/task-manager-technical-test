import { BobbingDots } from "@/components/ui/bobbing-dots";
import { Button } from "@/components/ui/button";
import { AlertCircle, Inbox } from "lucide-react";
import type {
  AvatarProps,
  EmptyProps,
  LoadErrorProps,
} from "./types/feedback.types";

export function Loading() {
  return (
    <div className="feedback loading-feedback">
      <BobbingDots className="text-primary" />
      <span aria-hidden="true">Cargando…</span>
    </div>
  );
}
export function LoadError({ error, retry }: LoadErrorProps) {
  return (
    <div role="alert" className="feedback error-box">
      <AlertCircle />
      <p>{error.message}</p>
      <Button variant="outline" onClick={retry}>
        Reintentar
      </Button>
    </div>
  );
}
export function Empty({ text = "No hay tareas en este estado" }: EmptyProps) {
  return (
    <div className="feedback empty">
      <Inbox size={28} />
      <p>{text}</p>
      <span>Los nuevos elementos aparecerán aquí.</span>
    </div>
  );
}
export function Avatar({ name, id = 0 }: AvatarProps) {
  return (
    <span className={`person-avatar color-${id % 4}`} title={name}>
      {name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
