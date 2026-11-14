import type { ReactNode } from "react";

export type Messages = Record<string, string>;

export type LocaleMessages = Record<string, Partial<Messages>>;

export type LocaleContextValue = {
  locale?: string;
  messages: LocaleMessages;
};

export interface LocaleProviderProps {
  /** BCP 47 tag, e.g. `de`, `pt-BR`. Drives `Intl` number formatting. */
  locale: string;
  /**
   * Component namespace → translated strings. Missing keys fall back to English.
   * Pass a stable object (a module constant, imported JSON or a memoized value):
   * a new object each render gives every translated component a new `t`.
   */
  messages?: LocaleMessages;
  children: ReactNode;
}
