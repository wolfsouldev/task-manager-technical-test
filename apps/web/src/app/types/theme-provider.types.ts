import type { Resolved } from "@animate-ui/react/primitives/effects/theme-toggler";
import type { ReactNode } from "react";

export type ThemeProviderProps = { children: ReactNode };

export type ThemeContextValue = {
  theme: Resolved;
  setTheme: (theme: Resolved) => void;
};
