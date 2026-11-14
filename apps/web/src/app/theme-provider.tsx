import type { Resolved } from "@animate-ui/react/primitives/effects/theme-toggler";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import type {
  ThemeContextValue,
  ThemeProviderProps,
} from "./types/theme-provider.types";

const storageKey = "task-manager:theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function readTheme(): Resolved {
  try {
    return localStorage.getItem(storageKey) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, updateTheme] = useState<Resolved>(readTheme);
  const setTheme = useCallback((next: Resolved) => {
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      /* Theme still works without storage. */
    }
    updateTheme(next);
  }, []);
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#141517" : "#f7f8fa");
  }, [theme]);
  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme requiere ThemeProvider");
  return context;
}
