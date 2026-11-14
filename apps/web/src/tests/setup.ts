import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
afterEach(cleanup);
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.setPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
// JSDOM has no layout observer. Real sizing/motion is checked in Chromium.
vi.stubGlobal(
  "ResizeObserver",
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);
// This browser API must survive vi.resetAllMocks() in individual test suites.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => true,
  }),
});

vi.stubGlobal(
  "SVGGeometryElement",
  class SVGGeometryElement extends SVGElement {},
);
// Animate UI uses WAAPI for surface copies/value transitions. JSDOM does not.
Element.prototype.getAnimations = () => [];
Element.prototype.animate = () =>
  ({
    finished: Promise.resolve(),
    ready: Promise.resolve(),
    cancel() {},
    finish() {},
    play() {},
    pause() {},
    reverse() {},
    addEventListener() {},
    removeEventListener() {},
    effect: { getComputedTiming: () => ({ endTime: 0 }) },
    playState: "finished",
    currentTime: 0,
  }) as unknown as Animation;
