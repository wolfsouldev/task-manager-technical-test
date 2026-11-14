import DOMPurify from "dompurify";

export const DESCRIPTION_LIMIT = 20_000;

export function cleanDescription(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
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
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
}

export function descriptionText(html: string) {
  if (!html) return "";
  const document = new DOMParser().parseFromString(
    cleanDescription(html),
    "text/html",
  );
  document.querySelectorAll("br").forEach((node) => node.replaceWith(" "));
  document
    .querySelectorAll("p,li,h2,h3,blockquote,pre")
    .forEach((node) => node.append(" "));
  return (document.body.textContent ?? "").replace(/\s+/g, " ").trim();
}
