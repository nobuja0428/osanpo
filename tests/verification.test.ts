import { describe, expect, it } from "vitest";
import { isExpired, revalidationQueue, verificationFor } from "@/lib/verification";

describe("content verification expiry", () => {
  it("detects expiry in Asia/Tokyo date boundaries", () => {
    const area = verificationFor("area", "koenji");
    expect(area).toBeDefined();
    expect(isExpired(area!, new Date("2026-10-31T23:59:59+09:00"))).toBe(false);
    expect(isExpired(area!, new Date("2026-11-01T00:00:00+09:00"))).toBe(true);
  });
  it("adds expired records to the revalidation queue", () => {
    expect(revalidationQueue(new Date("2026-07-31T12:00:00+09:00")).map((item) => item.key)).toEqual(expect.arrayContaining(["event:kagurazaka-festival-2026"]));
  });
});
