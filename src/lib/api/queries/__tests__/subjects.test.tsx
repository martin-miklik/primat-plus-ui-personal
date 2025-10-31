import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect } from "vitest";
import { useSubjects } from "../subjects";

// Helper to create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  Wrapper.displayName = "QueryClientWrapper";

  return Wrapper;
}

describe("useSubjects", () => {
  it("should fetch subjects successfully", async () => {
    const { result } = renderHook(() => useSubjects(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check data structure
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.data).toBeInstanceOf(Array);
    expect(result.current.data?.data.length).toBeGreaterThan(0);

    // Check first subject has expected fields
    const firstSubject = result.current.data?.data[0];
    expect(firstSubject).toHaveProperty("id");
    expect(firstSubject).toHaveProperty("name");
    expect(firstSubject).toHaveProperty("description");
  });
});
