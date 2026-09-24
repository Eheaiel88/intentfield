import { describe, expect, it } from "vitest";
import {
  previewHref,
  previewTotal,
  readPreviewSelection,
} from "./sales-walkthrough";

describe("sample sales journey", () => {
  it.each([
    [false, false, 19],
    [false, true, 48],
    [true, false, 98],
    [true, true, 127],
  ] as const)(
    "retains course=%s, audio=%s and the $%s total after a reload",
    (course, audio, total) => {
      const url = new URL(
        previewHref("complete", { course, audio }),
        "https://example.com",
      );
      const restored = readPreviewSelection(
        Object.fromEntries(url.searchParams),
      );
      expect(restored).toEqual({ course, audio });
      expect(previewTotal(restored)).toBe(total);
    },
  );

  it("starts a new walkthrough without carrying earlier selections", () => {
    const url = new URL(
      previewHref("book", { course: true, audio: true }),
      "https://example.com",
    );
    expect(url.pathname).toBe("/checkout");
    expect(readPreviewSelection(Object.fromEntries(url.searchParams))).toEqual({
      course: false,
      audio: false,
    });
  });

  it("ignores unrecognized, repeated and unrelated query values", () => {
    const selection = readPreviewSelection({
      course: ["1", "0"],
      audio: "true",
      price: "0",
      paid: "1",
    });
    expect(selection).toEqual({ course: false, audio: false });
    expect(previewTotal(selection)).toBe(19);
  });
});
