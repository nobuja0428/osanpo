import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { businessContact, businessListingApplicationEnabled, businessListingFields, businessServices, resolveBusinessContact } from "@/content/business";

describe("business service safety defaults", () => {
  it("keeps production contact and listing application disabled", () => {
    expect(businessContact).toBeNull();
    expect(businessListingApplicationEnabled).toBe(false);
  });

  it("only resolves an enabled public form or email fixture", () => {
    expect(resolveBusinessContact({ enabled: true, formUrl: "https://docs.google.com/forms/d/e/TEST_FORM_ID/viewform", email: "" })).toEqual({ kind: "form", href: "https://docs.google.com/forms/d/e/TEST_FORM_ID/viewform" });
    expect(resolveBusinessContact({ enabled: true, formUrl: "", email: "contact@example.test" })).toEqual({ kind: "email", href: "mailto:contact@example.test" });
    expect(resolveBusinessContact({ enabled: false, formUrl: "https://docs.google.com/forms/d/e/TEST_FORM_ID/viewform", email: "contact@example.test" })).toBeNull();
  });

  it("uses reference pricing without promising outcomes", () => {
    expect(businessServices.map((service) => service.id)).toEqual(["store-page", "map-guidance", "website", "support"]);
    expect(businessServices.every((service) => service.priceNote.includes("参考価格") || service.priceNote.includes("目安"))).toBe(true);
  });

  it("defines future listing fields without storing a submission", () => {
    expect(businessListingFields.map((field) => field.key)).toContain("contact");
    expect(businessListingFields.find((field) => field.key === "contact")?.personalData).toBe(true);
  });

  it("limits business click parameters to non-identifying fields", () => {
    const script = readFileSync("src/components/InlineEnhancements.tsx", "utf8");
    expect(script).toContain('"store_listing_interest"');
    expect(script).toContain('service_type: link.dataset.serviceType || ""');
    expect(script).toContain('content_id: link.dataset.contentId || "", page_type: link.dataset.pageType || "", service_type: link.dataset.serviceType || "", placement: link.dataset.placement || ""');
  });
});
