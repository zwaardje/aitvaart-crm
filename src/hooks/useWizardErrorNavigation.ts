"use client";

import { useWizard } from "@/components/ui/Wizard";
import { findFirstStepWithError } from "@/lib/wizard-utils";
import type { FieldToStepMap } from "@/types/wizard";

/**
 * Custom hook for automatic error navigation in wizard forms
 *
 * This hook automatically navigates to the first step containing validation errors
 * when form submission fails. It must be used within both Wizard and Form contexts.
 *
 * @param fieldToStepMap - Mapping of field paths to step numbers
 * @returns An error handler function that can be passed to Form's onError prop
 */
export function useWizardErrorNavigation(
  fieldToStepMap: FieldToStepMap
): (errors: any) => void {
  const { goToStep } = useWizard();

  const handleError = (errors: any) => {
    const firstErrorStep = findFirstStepWithError(errors, fieldToStepMap);
    if (firstErrorStep !== null) {
      goToStep(firstErrorStep);
    }
  };

  return handleError;
}
