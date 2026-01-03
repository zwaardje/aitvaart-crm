/**
 * Utility functions for price calculations and conversions
 */

/**
 * Calculate price excluding VAT from price including VAT
 * @param priceIncl - Price including VAT
 * @param vatRate - VAT rate as percentage (e.g., 21 for 21%)
 * @returns Price excluding VAT
 */
export function calculatePriceExcl(priceIncl: number, vatRate: number): number {
  if (vatRate === 0) return priceIncl;
  return priceIncl / (1 + vatRate / 100);
}

/**
 * Calculate price including VAT from price excluding VAT
 * @param priceExcl - Price excluding VAT
 * @param vatRate - VAT rate as percentage (e.g., 21 for 21%)
 * @returns Price including VAT
 */
export function calculatePriceIncl(priceExcl: number, vatRate: number): number {
  return priceExcl * (1 + vatRate / 100);
}

/**
 * Calculate unit price excluding VAT for funeral_suppliers table
 * This is used when converting pricelist items to funeral costs
 * @param priceIncl - Price including VAT from pricelist item
 * @param vatRate - VAT rate as percentage (e.g., 21 for 21%)
 * @returns Unit price excluding VAT (rounded to 2 decimals)
 */
export function calculateUnitPriceExcl(
  priceIncl: number,
  vatRate: number | null
): number {
  const effectiveVatRate = vatRate ?? 0;
  const unitPrice = calculatePriceExcl(priceIncl, effectiveVatRate);
  return Math.round(unitPrice * 100) / 100; // Round to 2 decimals
}

