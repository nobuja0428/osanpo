import { describe, expect, it } from "vitest";
import { revenueSlots } from "@/content/monetization";

describe("revenue placement defaults", () => {
  it("keeps every unconfigured slot hidden", () => expect(revenueSlots.every((slot) => slot.active === false && !slot.destination)).toBe(true));
  it("reserves affiliate click tracking only for a future approved link", () => expect(revenueSlots.every((slot) => slot.trackingEvent === "affiliate_click")).toBe(true));
});
