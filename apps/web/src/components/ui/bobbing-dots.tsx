import { cn } from "@/lib/utils";
import {
  useMotionTokens,
  useShouldReduceMotion,
} from "@animate-ui/react/utils/motion";
import { motion } from "motion/react";
import type { BobbingDotsProps } from "./types/bobbing-dots.types";

export function BobbingDots({
  className,
  dots = 3,
  duration = 1,
  label = "Cargando…",
  ...props
}: BobbingDotsProps) {
  const reduceMotion = useShouldReduceMotion();
  const { tempo } = useMotionTokens();

  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-slot="bobbing-dots"
      className={cn("inline-flex h-8 items-center gap-2", className)}
      {...props}
    >
      {Array.from({ length: dots }, (_, index) => {
        const dotProps = {
          "aria-hidden": true,
          "data-slot": "bobbing-dot",
          // Give every dot a real size, even without a width on the container.
          className:
            "block size-2.5 shrink-0 rounded-full bg-current shadow-sm",
        } as const;

        return reduceMotion ? (
          <span key={index} {...dotProps} />
        ) : (
          <motion.span
            key={index}
            {...dotProps}
            initial={{ y: 0 }}
            animate={{ y: [0, "0.625em", 0] }}
            transition={{
              duration: duration * tempo,
              repeat: Infinity,
              repeatType: "loop",
              delay: index * 0.2 * tempo,
              ease: "easeInOut",
            }}
          />
        );
      })}
      <span className="sr-only">{label}</span>
    </span>
  );
}
