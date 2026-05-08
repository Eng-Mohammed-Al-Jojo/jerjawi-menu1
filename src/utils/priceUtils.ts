/**
 * Safely converts any value to a number, returning null for invalid inputs.
 * Handles comma-separated strings by taking the first value.
 */
export function toSafeNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;

  // Handle comma-separated strings (legacy format: "25,30")
  const str = String(val).split(",")[0].trim();
  const n = Number(str);
  return isNaN(n) ? null : n;
}

export function toSafeNumberList(val: unknown): number[] {
  if (val === null || val === undefined || val === "") return [];

  return String(val)
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => !isNaN(n));
}

export type PriceType = "dineIn" | "takeaway";

export interface MenuPriceOption {
  type: PriceType;
  label: "DIN" | "TW";
  price: number;
}

export function getMenuPriceOptions(item: { price?: unknown }): MenuPriceOption[] {
  const prices = toSafeNumberList(item.price);
  const options: MenuPriceOption[] = [];

  prices.forEach((price) => {
    options.push({ type: "dineIn", label: "DIN", price });
  });

  return options;
}

export function getMenuPricesForType(
  item: { price?: unknown },
  type: PriceType
): MenuPriceOption[] {
  const prices = toSafeNumberList(item.price);
  const label = type === "dineIn" ? "DIN" : "TW";

  return prices.map((price) => ({ type, label, price }));
}

export function isPriceTypeEnabled(
  type: PriceType,
  config: { dineInEnabled: boolean; takeawayEnabled: boolean } | Record<PriceType, boolean>
) {
  if (type === "dineIn") return (config as any).dineInEnabled ?? true;
  if (type === "takeaway") return (config as any).takeawayEnabled ?? true;
  return true;
}

export function getItemOrderPermissions(
  item: { dineInOrderEnabled?: boolean; takeawayOrderEnabled?: boolean },
  config: { dineInEnabled: boolean; takeawayEnabled: boolean }
): Record<PriceType, boolean> {
  return {
    dineIn: item.dineInOrderEnabled ?? config.dineInEnabled,
    takeaway: item.takeawayOrderEnabled ?? config.takeawayEnabled,
  };
}
