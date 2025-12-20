/**
 * Type definitions for wizard components
 */

/**
 * Mapping of form field paths to wizard step numbers
 * Field paths can be flat (e.g., "companyName") or nested (e.g., "deceased.first_names")
 */
export type FieldToStepMap = Record<string, number>;
