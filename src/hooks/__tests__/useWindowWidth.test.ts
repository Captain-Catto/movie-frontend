import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWindowWidth } from "../useWindowWidth";

describe("useWindowWidth", () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    vi.stubGlobal("innerWidth", 1024);
  });

  afterEach(() => {
    vi.stubGlobal("innerWidth", originalInnerWidth);
    vi.restoreAllMocks();
  });

  it("should return current window width", () => {
    vi.stubGlobal("innerWidth", 1200);
    const { result } = renderHook(() => useWindowWidth());
    expect(result.current.width).toBe(1200);
  });

  it("should return desktop breakpoint for width >= 1024", () => {
    vi.stubGlobal("innerWidth", 1024);
    const { result } = renderHook(() => useWindowWidth());
    expect(result.current.breakpoint).toBe("desktop");
  });

  it("should return tablet breakpoint for width >= 640 and < 1024", () => {
    vi.stubGlobal("innerWidth", 800);
    const { result } = renderHook(() => useWindowWidth());
    expect(result.current.breakpoint).toBe("tablet");
  });

  it("should return mobile breakpoint for width < 640", () => {
    vi.stubGlobal("innerWidth", 500);
    const { result } = renderHook(() => useWindowWidth());
    expect(result.current.breakpoint).toBe("mobile");
  });

  it("should update on window resize", () => {
    vi.stubGlobal("innerWidth", 1200);
    const { result } = renderHook(() => useWindowWidth());
    expect(result.current.breakpoint).toBe("desktop");

    act(() => {
      vi.stubGlobal("innerWidth", 500);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current.width).toBe(500);
    expect(result.current.breakpoint).toBe("mobile");
  });

  it("should cleanup event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useWindowWidth());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });
});
