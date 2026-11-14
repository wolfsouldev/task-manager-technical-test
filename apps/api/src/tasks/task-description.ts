import { BadRequestException } from "@nestjs/common";
import sanitizeHtml from "sanitize-html";

// Match the editor's small formatting vocabulary. No attributes, links,
// images, embeds, styles or executable content are persisted.
export function sanitizeDescription(html: string) {
  const clean = sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "hr",
    ],
    allowedAttributes: {},
  });
  if (clean.length > 20_000)
    throw new BadRequestException({
      message: "La descripción es demasiado larga",
      fieldErrors: {
        description: "La descripción no puede superar 20 000 caracteres HTML",
      },
    });
  return clean;
}
