export const CURRENCY = "EUR";

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: CURRENCY }).format(cents / 100);
}
