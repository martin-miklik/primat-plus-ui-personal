# Testing Guide

## 🧪 Testing Stack

- **Vitest** - Fast unit test framework
- **Testing Library** - React component testing
- **MSW** - API mocking for tests
- **jsdom** - DOM environment

## 🚀 Quick Start

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## 📁 Test Structure

Tests are colocated with source files:

```
src/
├── lib/
│   └── api/
│       └── queries/
│           ├── subjects.ts
│           └── __tests__/
│               └── subjects.test.tsx
```

## ✅ What's Configured

### Vitest Config (`vitest.config.mts`)
- ✅ React plugin enabled
- ✅ jsdom environment
- ✅ Global test utilities (describe, it, expect)
- ✅ Path aliases (@/ → src/)
- ✅ Coverage reporting

### Test Setup (`vitest.setup.ts`)
- ✅ MSW server automatically enabled
- ✅ Request handlers reset after each test
- ✅ React Testing Library cleanup
- ✅ jest-dom matchers available

## 📝 Writing Tests

### Basic Test Example

```typescript
import { describe, it, expect } from "vitest";

describe("MyFunction", () => {
  it("should work correctly", () => {
    expect(1 + 1).toBe(2);
  });
});
```

### Testing React Hooks with MSW

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect } from "vitest";
import { useSubjects } from "../subjects";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe("useSubjects", () => {
  it("should fetch subjects successfully", async () => {
    const { result } = renderHook(() => useSubjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeInstanceOf(Array);
  });
});
```

### Testing Components

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### Overriding MSW Handlers

```typescript
import { server } from "@/mocks/server";
import { http, HttpResponse } from "msw";
import { describe, it, expect } from "vitest";

describe("Error Handling", () => {
  it("handles 500 error", async () => {
    server.use(
      http.get("/api/subjects", () => {
        return HttpResponse.json(
          { error: "Server error" },
          { status: 500 }
        );
      })
    );

    // Your test code...
  });
});
```

## 🎯 Best Practices

### 1. Disable Retry in Tests
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});
```

### 2. Use Proper Matchers
```typescript
// ✅ Good - specific matcher
expect(element).toBeInTheDocument();

// ❌ Bad - too generic
expect(element).toBeTruthy();
```

### 3. Clean Test Isolation
```typescript
// MSW handlers are automatically reset after each test
// No need to manually reset in most cases
```

### 4. Test File Naming
- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

### 5. Async Testing
```typescript
// ✅ Use waitFor for async state changes
await waitFor(() => {
  expect(result.current.isSuccess).toBe(true);
});

// ❌ Don't use arbitrary delays
await new Promise(resolve => setTimeout(resolve, 1000));
```

## 📊 Coverage

Run coverage report:
```bash
pnpm test:coverage
```

Coverage is configured to exclude:
- `node_modules/`
- `src/mocks/` (mock data)
- `*.config.*` (config files)
- `.next/` (build output)

## 🛠️ Available Matchers

Thanks to `@testing-library/jest-dom`:

```typescript
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent("Hello");
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveClass("active");
expect(element).toHaveAttribute("href", "/home");
```

## 🔍 Debugging Tests

### UI Mode (Recommended)
```bash
pnpm test:ui
```
Opens browser with test UI for easier debugging.

### Console Logging
```typescript
import { screen } from "@testing-library/react";

// Debug rendered output
screen.debug();

// Debug specific element
screen.debug(element);
```

### VSCode Integration
Add to `.vscode/settings.json`:
```json
{
  "vitest.enable": true,
  "vitest.commandLine": "pnpm test"
}
```

## 🚨 Common Issues

### Issue: MSW handlers not working
**Solution:** MSW server starts automatically via `vitest.setup.ts`. Handlers are registered in `src/mocks/handlers/`.

### Issue: Module resolution errors
**Solution:** Check `vitest.config.mts` has correct path alias:
```typescript
resolve: {
  alias: {
    "@": fileURLToPath(new URL("./src", import.meta.url)),
  },
}
```

### Issue: JSX errors in tests
**Solution:** Use `.tsx` extension for test files with JSX:
```bash
# ✅ Correct
subjects.test.tsx

# ❌ Wrong
subjects.test.ts
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)

## ✅ Testing Checklist

When writing tests:
- [ ] Test file named correctly (`.test.tsx` for JSX)
- [ ] MSW handlers registered (automatic)
- [ ] Query client wrapper for hooks
- [ ] Retry disabled in test queries
- [ ] Async operations use `waitFor`
- [ ] Specific matchers used
- [ ] Clean test isolation (no shared state)


