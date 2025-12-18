import { describe, it, expect } from "vitest";
import {
  normalizeRatingValue,
  normalizeRatingFromSource,
} from "../rating";

describe("normalizeRatingValue", () => {
  it("should normalize valid positive numbers", () => {
    expect(normalizeRatingValue(7.5)).toBe(7.5);
    expect(normalizeRatingValue(10)).toBe(10);
    expect(normalizeRatingValue(0)).toBe(0);
    expect(normalizeRatingValue(8.123456)).toBe(8.1);
  });

  it("should round to 1 decimal place", () => {
    expect(normalizeRatingValue(7.89)).toBe(7.9);
    expect(normalizeRatingValue(7.12)).toBe(7.1);
    expect(normalizeRatingValue(7.95)).toBe(8.0);
  });

  it("should handle string numbers", () => {
    expect(normalizeRatingValue("7.5")).toBe(7.5);
    expect(normalizeRatingValue("10")).toBe(10);
    expect(normalizeRatingValue("0")).toBe(0);
  });

  it("should return 0 for negative numbers", () => {
    expect(normalizeRatingValue(-5)).toBe(0);
    expect(normalizeRatingValue(-1.5)).toBe(0);
  });

  it("should return 0 for invalid values", () => {
    expect(normalizeRatingValue(NaN)).toBe(0);
    expect(normalizeRatingValue(Infinity)).toBe(0);
    expect(normalizeRatingValue(-Infinity)).toBe(0);
    expect(normalizeRatingValue(undefined)).toBe(0);
    expect(normalizeRatingValue(null)).toBe(0);
    expect(normalizeRatingValue("invalid")).toBe(0);
    expect(normalizeRatingValue({})).toBe(0);
    expect(normalizeRatingValue([])).toBe(0);
  });

  it("should handle edge cases", () => {
    expect(normalizeRatingValue(0.0)).toBe(0);
    expect(normalizeRatingValue(0.1)).toBe(0.1);
    expect(normalizeRatingValue(9.99)).toBe(10.0);
  });
});

describe("normalizeRatingFromSource", () => {
  it("should use primary value if valid", () => {
    expect(normalizeRatingFromSource(8.5)).toBe(8.5);
    expect(normalizeRatingFromSource(7.0)).toBe(7);
  });

  it("should fallback to source.rating if primary invalid", () => {
    expect(normalizeRatingFromSource(undefined, { rating: 7.5 })).toBe(7.5);
    expect(normalizeRatingFromSource(NaN, { rating: 8.0 })).toBe(8);
  });

  it("should fallback to source.score if rating invalid", () => {
    expect(normalizeRatingFromSource(undefined, { score: 9.5 })).toBe(9.5);
    expect(normalizeRatingFromSource(undefined, { rating: undefined, score: 7.5 })).toBe(7.5);
  });

  it("should fallback to source.voteAverage", () => {
    expect(normalizeRatingFromSource(undefined, { voteAverage: 8.5 })).toBe(8.5);
    expect(
      normalizeRatingFromSource(undefined, {
        rating: undefined,
        score: undefined,
        voteAverage: 7.0,
      })
    ).toBe(7);
  });

  it("should fallback to source.vote_average", () => {
    expect(normalizeRatingFromSource(undefined, { vote_average: 8.5 })).toBe(8.5);
    expect(
      normalizeRatingFromSource(undefined, {
        rating: undefined,
        score: undefined,
        voteAverage: undefined,
        vote_average: 6.5,
      })
    ).toBe(6.5);
  });

  it("should return 0 if all values invalid", () => {
    expect(normalizeRatingFromSource(null)).toBe(0);
    expect(normalizeRatingFromSource(undefined, {})).toBe(0);
    expect(
      normalizeRatingFromSource(null, {
        rating: null,
        score: undefined,
        voteAverage: NaN,
        vote_average: -1,
      })
    ).toBe(0);
  });

  it("should handle mixed valid and invalid values", () => {
    expect(
      normalizeRatingFromSource(undefined, {
        rating: undefined,
        score: 8.7,
        voteAverage: 9.0,
      })
    ).toBe(8.7); // Should stop at first valid value (score)
  });

  it("should normalize the selected value", () => {
    expect(normalizeRatingFromSource(7.123, {})).toBe(7.1);
    expect(normalizeRatingFromSource(undefined, { rating: 8.956 })).toBe(9.0);
  });

  it("should handle string values in source", () => {
    expect(normalizeRatingFromSource(undefined, { rating: "7.5" })).toBe(7.5);
    expect(normalizeRatingFromSource(undefined, { vote_average: "8.0" })).toBe(8);
  });

  it("should skip negative values and continue to next candidate", () => {
    expect(
      normalizeRatingFromSource(-5, {
        rating: -1,
        score: 7.5,
      })
    ).toBe(7.5);
  });
});
