/**
 * Currency formatting utilities
 */

/**
 * Format currency with proper locale and symbols
 * @param amount - Amount to format
 * @param currency - Currency code (UZS, USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: "UZS" | "USD" = "UZS"): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // UZS formatting
  const formatted = new Intl.NumberFormat("uz-UZ").format(amount);
  return `${formatted} so'm`;
}


