import { AnimateUIProvider } from "@animate-ui/react/provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { queryClient } from "./query-client";
import { ThemeProvider, useTheme } from "./theme-provider";
import type { ProvidersProps } from "./types/providers.types";

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme} richColors closeButton />;
}
export function Providers({ children }: ProvidersProps) {
  return (
    <AnimateUIProvider reducedMotion="user" tempo={0.85}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>{children}</BrowserRouter>
          <ThemedToaster />
        </QueryClientProvider>
      </ThemeProvider>
    </AnimateUIProvider>
  );
}
