import { useTheme } from "@/app/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggler } from "@animate-ui/react/primitives/effects/theme-toggler";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";

export function ThemeButton() {
  const { theme, setTheme } = useTheme();
  const [switching, setSwitching] = useState(false);
  return (
    <ThemeToggler
      theme={theme}
      resolvedTheme={theme}
      onImmediateChange={() => setSwitching(true)}
      setTheme={(next) => {
        setTheme(next === "light" ? "light" : "dark");
        setSwitching(false);
      }}
    >
      {({ effective, toggleTheme }) => {
        const next = effective === "dark" ? "light" : "dark";
        const label =
          next === "light" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={label}
                disabled={switching}
                aria-busy={switching}
                onClick={async () => {
                  try {
                    await toggleTheme(next);
                  } catch {
                    setTheme(next);
                    setSwitching(false);
                  }
                }}
              >
                {next === "light" ? (
                  <Sun aria-hidden="true" />
                ) : (
                  <Moon aria-hidden="true" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{label}</TooltipContent>
          </Tooltip>
        );
      }}
    </ThemeToggler>
  );
}
