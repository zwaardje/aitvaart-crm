/**
 * Helper functions for mapping enum values to display text
 * Uses constants from form-options.ts for consistency
 */

import {
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RELATION_OPTIONS,
} from "@/constants/form-options";

/**
 * Map gender code to Dutch display text
 * @param gender - Gender code (male, female, other) or null/undefined
 * @returns Dutch gender text or "-" if invalid/missing
 */
export function mapGender(gender: string | null | undefined): string {
  if (!gender) return "-";
  const option = GENDER_OPTIONS.find((opt) => opt.value === gender);
  return option?.label || "-";
}

/**
 * Map marital status code to Dutch display text
 * @param status - Marital status code or null/undefined
 * @returns Dutch marital status text or "-" if invalid/missing
 */
export function mapMaritalStatus(status: string | null | undefined): string {
  if (!status) return "-";
  const option = MARITAL_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label || "-";
}

/**
 * Get relation display text from relation code
 * @param relation - Relation code or null/undefined
 * @returns Dutch relation text or "-" if invalid/missing
 */
export function getRelationText(relation: string | null | undefined): string {
  if (!relation) return "-";
  const option = RELATION_OPTIONS.find((opt) => opt.value === relation);
  return option?.label || "-";
}

/**
 * Truncate text to a maximum length while preserving word boundaries
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 120)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number = 120
): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  // Find the last space or punctuation before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpace = Math.max(
    truncated.lastIndexOf(" "),
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?")
  );

  // If we found a good break point, use it; otherwise just cut at maxLength
  const breakPoint = lastSpace > maxLength * 0.7 ? lastSpace : maxLength;
  return text.substring(0, breakPoint).trim() + "...";
}
