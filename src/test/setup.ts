import "@testing-library/jest-dom/vitest";

// jsdom has no ResizeObserver. Radix needs it for the hidden input it renders
// behind a Checkbox or Switch that sits inside a form.
if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
