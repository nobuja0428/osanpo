export type InventoryIssue = { level: "error" | "warning"; code: string; message: string };
export function validateMonetizationInventory(input: {
  sponsors: readonly Record<string, unknown>[];
  affiliates: readonly Record<string, unknown>[];
  housePlacements: Record<string, boolean>;
  pageTypeByPlacement: Record<string, string>;
}, now?: Date): InventoryIssue[];
