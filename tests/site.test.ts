import { describe, expect, it } from "vitest";
import { absoluteUrl, assetUrl, sitePath } from "@/lib/site";

describe("site paths", () => {
  it("keeps the GitHub Pages base path", () => {
    expect(sitePath("courses/koenji-first")).toBe("/osanpo/courses/koenji-first/");
    expect(assetUrl("assets/images/hero/hero-tokyo-walk.webp")).toBe("/osanpo/assets/images/hero/hero-tokyo-walk.webp");
  });

  it("uses the official production URL", () => {
    expect(absoluteUrl("courses/")).toBe("https://nobuja0428.github.io/osanpo/courses/");
  });
});
