"use client";

import type { ScrambleProps } from "./types/glitch.types";
import { useShouldReduceMotion } from "@animate-ui/react/utils/motion";
import { useEffect, useState } from "react";
import {
  NOT_FOUND_DEFAULTS,
  NotFoundActions,
  type NotFoundProps,
  NotFoundStage,
  useNotFoundMessages,
} from "./shared";

// beui.dev/components/blocks/not-found

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?/\\";
const SCRAMBLE_MS = 700;
const TICK_MS = 45;

/**
 * Renders the code, scrambling each character on mount before it settles.
 * SSR and the first paint show the real code, so the scramble is a pure
 * client-side enhancement and reduced-motion users see the code immediately.
 */
function Scramble({ text }: ScrambleProps) {
  const reduce = useShouldReduceMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (reduce) {
      setDisplay(text);
      return;
    }
    const chars = text.split("");
    const start = performance.now();
    let raf = 0;
    let last = 0;

    const loop = (now: number) => {
      if (now - last >= TICK_MS) {
        last = now;
        const progress = Math.min((now - start) / SCRAMBLE_MS, 1);
        const settled = Math.floor(progress * chars.length);
        setDisplay(
          chars
            .map((ch, i) =>
              i < settled || ch === " "
                ? ch
                : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            )
            .join(""),
        );
      }
      if (now - start < SCRAMBLE_MS) {
        raf = requestAnimationFrame(loop);
      } else {
        setDisplay(text);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [text, reduce]);

  return <span className="tabular-nums">{display}</span>;
}

export function NotFoundGlitch({
  className,
  code = NOT_FOUND_DEFAULTS.code,
  title,
  description,
  homeHref,
  homeLabel,
  browseHref,
  browseLabel,
  labels,
}: NotFoundProps) {
  const t = useNotFoundMessages(labels);
  const reduce = useShouldReduceMotion();
  return (
    <NotFoundStage className={className}>
      <div className="not-found-code group relative select-none font-mono font-bold leading-none tracking-tighter text-foreground [font-size:clamp(5rem,18vw,11rem)]">
        {/* Chromatic ghost layers, nudged apart on hover. */}
        {!reduce && (
          <>
            <span
              aria-hidden="true"
              className="not-found-ghost pointer-events-none absolute inset-0 text-[#ff0040] opacity-0 mix-blend-screen transition-[transform,opacity] duration-150 ease-out group-hover:translate-x-[3px] group-hover:opacity-70 motion-reduce:hidden"
            >
              <Scramble text={code} />
            </span>
            <span
              aria-hidden="true"
              className="not-found-ghost pointer-events-none absolute inset-0 text-[#00e5ff] opacity-0 mix-blend-screen transition-[transform,opacity] duration-150 ease-out group-hover:-translate-x-[3px] group-hover:opacity-70 motion-reduce:hidden"
            >
              <Scramble text={code} />
            </span>
          </>
        )}
        <h1 aria-label={code} className="relative">
          <span aria-hidden="true">
            <Scramble text={code} />
          </span>
        </h1>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          {title ?? t("title")}
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {description ?? t("description")}
        </p>
      </div>

      <NotFoundActions
        homeHref={homeHref}
        homeLabel={homeLabel}
        browseHref={browseHref}
        browseLabel={browseLabel}
        labels={labels}
      />
    </NotFoundStage>
  );
}
