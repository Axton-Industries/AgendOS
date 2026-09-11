export const fmtCents = (c: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(c / 100);