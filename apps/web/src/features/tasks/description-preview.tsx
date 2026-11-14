import { descriptionText } from "./description";
import type { DescriptionPreviewProps } from "./types/description-preview.types";

export function DescriptionPreview({ html }: DescriptionPreviewProps) {
  const text = descriptionText(html);
  if (!text) return null;
  return (
    <p className="task-description-preview">
      {text.length > 240 ? `${text.slice(0, 240).trimEnd()}…` : text}
    </p>
  );
}
