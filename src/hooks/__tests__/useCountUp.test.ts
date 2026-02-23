import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCountUp } from "../useCountUp";

describe("useCountUp", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return initial value", () => {
    const { result } = renderHook(() => useCountUp(100));
    // Initial render might show the starting value being animated
    expect(typeof result.current).toBe("number");
  });

  it("should animate to target value", async () => {
    vi.useRealTimers(); // Use real timers for animation frame
    
    const { result } = renderHook(() => useCountUp(100, { duration: 100 }));
    
    await waitFor(() => {
      expect(result.current).toBe(100);
    }, { timeout: 500 });
  });

  it("should respect decimals option", async () => {
    vi.useRealTimers();
    
    const { result } = renderHook(() => 
      useCountUp(99.99, { duration: 100, decimals: 2 })
    );
    
    await waitFor(() => {
      expect(result.current).toBe(99.99);
    }, { timeout: 500 });
  });

  it("should animate from old value to new value on update", async () => {
    vi.useRealTimers();
    
    const { result, rerender } = renderHook(
      ({ value }) => useCountUp(value, { duration: 100 }),
      { initialProps: { value: 0 } }
    );
    
    await waitFor(() => {
      expect(result.current).toBe(0);
    }, { timeout: 500 });
    
    rerender({ value: 50 });
    
    await waitFor(() => {
      expect(result.current).toBe(50);
    }, { timeout: 500 });
  });

  it("should handle zero values", async () => {
    vi.useRealTimers();
    
    const { result } = renderHook(() => useCountUp(0, { duration: 100 }));
    
    await waitFor(() => {
      expect(result.current).toBe(0);
    }, { timeout: 500 });
  });

  it("should handle negative values", async () => {
    vi.useRealTimers();
    
    const { result } = renderHook(() => useCountUp(-50, { duration: 100 }));
    
    await waitFor(() => {
      expect(result.current).toBe(-50);
    }, { timeout: 500 });
  });
});
