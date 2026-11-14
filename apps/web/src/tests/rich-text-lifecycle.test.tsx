import { AnimateUIProvider } from "@animate-ui/react/provider";
import type { Editor } from "@tiptap/core";
import { act, render, screen, waitFor } from "@testing-library/react";
import { StrictMode, useLayoutEffect, useState } from "react";
import { expect, it, vi } from "vitest";
import { RichTextEditor } from "@/features/tasks/rich-text-editor";

it("no usa una instancia destruida entre el render y los efectos del editor", async () => {
  function InterruptedMount() {
    useLayoutEffect(() => {
      // Reproduce the lifetime gap: Tiptap can destroy an eagerly-created
      // editor before React commits its passive effects (e.g. a lazy dialog).
      const element = document.querySelector<HTMLElement & { editor?: Editor }>(
        ".ProseMirror",
      );
      element?.editor?.destroy();
    }, []);
    return (
      <>
        <label id="task-description-label">Descripción</label>
        <RichTextEditor
          value="<p>Contexto que debe conservarse</p>"
          onChange={vi.fn()}
          onBlur={vi.fn()}
        />
      </>
    );
  }
  render(
    <AnimateUIProvider reducedMotion="always">
      <InterruptedMount />
    </AnimateUIProvider>,
  );
  expect(
    await screen.findByRole("textbox", { name: "Descripción" }),
  ).toHaveTextContent("Contexto que debe conservarse");
});
