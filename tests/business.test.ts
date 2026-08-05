import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { businessContact, businessContactEmail, businessListingApplicationEnabled, businessListingFields, businessServices, emailContactHref, resolveBusinessContact } from "@/content/business";

describe("business service safety defaults", () => {
  it("enables the verified production email while keeping direct listing submission disabled", () => {
    expect(businessContact).toEqual({ kind: "email", href: `mailto:${businessContactEmail}` });
    expect(businessContactEmail).toBe("osanpo.contact.tokyo@gmail.com");
    expect(emailContactHref("listing")).toContain("subject=%E5%BA%97%E8%88%97%E6%8E%B2%E8%BC%89");
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
    expect(script).toContain('contact_type: link.dataset.contactType || ""');
    expect(script).not.toContain('email: link.dataset');
    expect(script).not.toContain('subject: link.dataset');
    expect(script).not.toContain('service_type: link.dataset');
  });
});
