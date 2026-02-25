import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsHydrated } from "../useIsHydrated";

describe("useIsHydrated", () => {
  it("should return false initially (before hydration)", () => {
    const { result } = renderHook(() => useIsHydrated());
    // After the effect runs, it should be true
    expect(result.current).toBe(true);
  });

  it("should return true after mount", () => {
    const { result } = renderHook(() => useIsHydrated());
    expect(result.current).toBe(true);
  });

  it("should remain true on re-renders", () => {
    const { result, rerender } = renderHook(() => useIsHydrated());
    expect(result.current).toBe(true);
    
    rerender();
    expect(result.current).toBe(true);
    
    rerender();
    expect(result.current).toBe(true);
  });
});
