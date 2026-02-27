import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup React trees between tests to avoid cross-test pollution
afterEach(() => {
  cleanup();
  localStorage.clear();
});
