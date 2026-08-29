import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// A couple of test files use the Jest global (`jest.fn()`) rather than
// Vitest's `vi` — alias it so they run unmodified under Vitest.
globalThis.jest = vi;
