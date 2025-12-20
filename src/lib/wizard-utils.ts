/**
 * Utility functions for wizard error navigation
 */

/**
 * Finds the first wizard step that contains validation errors
 * @param errors - React Hook Form errors object
 * @param fieldToStepMap - Mapping of field paths to step numbers
 * @returns The step number of the first error, or null if no errors found
 */
export function findFirstStepWithError(
  errors: any,
  fieldToStepMap: Record<string, number>
): number | null {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }

  let firstErrorStep: number | null = null;

  // Recursively check all error fields
  const checkErrors = (errorObj: any, path: string = "") => {
    for (const [key, value] of Object.entries(errorObj)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (value && typeof value === "object") {
        if ("message" in value) {
          // This is an error object with a message
          const step = fieldToStepMap[currentPath];
          if (step !== undefined) {
            if (firstErrorStep === null || step < firstErrorStep) {
              firstErrorStep = step;
            }
          }
        } else {
          // Nested object, recursively search
          checkErrors(value, currentPath);
        }
      }
    }
  };

  checkErrors(errors);
  return firstErrorStep;
}
