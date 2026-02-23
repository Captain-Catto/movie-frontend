import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { useClickOutside } from "../useClickOutside";

// Mock useIsHydrated to always return true in tests
vi.mock("../useIsHydrated", () => ({
  useIsHydrated: () => true,
}));

describe("useClickOutside", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should call handler when clicking outside the element", () => {
    const handler = vi.fn();
    const element = document.createElement("div");
    container.appendChild(element);

    const ref = { current: element };
    renderHook(() => useClickOutside(ref, handler));

    // Advance timers to let the setTimeout in the hook execute
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Click outside the element
    act(() => {
      document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should NOT call handler when clicking inside the element", () => {
    const handler = vi.fn();
    const element = document.createElement("div");
    const child = document.createElement("span");
    element.appendChild(child);
    container.appendChild(element);

    const ref = { current: element };
    renderHook(() => useClickOutside(ref, handler));

    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Click inside the element (on child)
    act(() => {
      child.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("should NOT call handler when clicking the element itself", () => {
    const handler = vi.fn();
    const element = document.createElement("div");
    container.appendChild(element);

    const ref = { current: element };
    renderHook(() => useClickOutside(ref, handler));

    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Click on the element itself
    act(() => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("should cleanup event listener on unmount", () => {
    const handler = vi.fn();
    const element = document.createElement("div");
    container.appendChild(element);

    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const ref = { current: element };
    const { unmount } = renderHook(() => useClickOutside(ref, handler));

    act(() => {
      vi.advanceTimersByTime(10);
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "click",
      expect.any(Function)
    );
  });

  it("should handle null ref gracefully", () => {
    const handler = vi.fn();
    const ref = { current: null };

    expect(() => {
      renderHook(() => useClickOutside(ref, handler));
      act(() => {
        vi.advanceTimersByTime(10);
      });
      document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }).not.toThrow();
  });

  it("should use latest handler reference", () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const element = document.createElement("div");
    container.appendChild(element);

    const ref = { current: element };
    const { rerender } = renderHook(
      ({ handler }) => useClickOutside(ref, handler),
      { initialProps: { handler: handler1 } }
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Update to handler2
    rerender({ handler: handler2 });

    // Click outside
    act(() => {
      document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});
