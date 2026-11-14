export const NOT_FOUND_DEFAULTS = {
  code: "404",
  homeHref: "/",
  browseHref: "/components/motion",
} as const;

export const notFoundMessages = {
  title: "Page not found",
  description:
    "The page you are looking for moved, vanished, or never existed.",
  homeLabel: "Back home",
  browseLabel: "Browse components",
  stackedCaption: "out of the deck",
  terminalError: "cd: no such file or directory: /page",
};
