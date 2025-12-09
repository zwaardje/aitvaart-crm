/**
 * Get nested error message from react-hook-form errors object
 * Supports both flat field names (e.g., "name") and nested field names (e.g., "deceased.first_names")
 * 
 * @param errors - The errors object from react-hook-form
 * @param fieldName - The field name, can be nested with dot notation (e.g., "deceased.first_names")
 * @returns The error message string or undefined if no error is found
 */
export function getNestedError(
  errors: any,
  fieldName: string
): string | undefined {
  if (!errors || !fieldName) {
    return undefined;
  }

  // Split field name by dots to handle nested paths
  const parts = fieldName.split(".");
  
  // Traverse the errors object following the path
  let current = errors;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  // Extract message from error object
  if (current && typeof current === "object" && "message" in current) {
    return current.message as string;
  }

  return undefined;
}

