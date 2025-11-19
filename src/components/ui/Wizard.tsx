"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { SubmitButton } from "@/components/forms/SubmitButton";

interface WizardContextType {
  currentStep: number;
  totalSteps: number;
  goToNext: () => void;
  goToPrevious: () => void;
  goToStep: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a Wizard component");
  }
  return context;
}

interface WizardProps {
  children: ReactNode;
  totalSteps: number;
  className?: string;
}

export function Wizard({ children, totalSteps, className }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const goToNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const contextValue: WizardContextType = {
    currentStep,
    totalSteps,
    goToNext,
    goToPrevious,
    goToStep,
    isFirstStep,
    isLastStep,
  };

  return (
    <WizardContext.Provider value={contextValue}>
      <div className={cn("w-full", className)}>{children}</div>
    </WizardContext.Provider>
  );
}

interface WizardStepProps {
  step: number;
  children: ReactNode;
  className?: string;
}

export function WizardStep({ step, children, className }: WizardStepProps) {
  const { currentStep } = useWizard();

  if (currentStep !== step) {
    return null;
  }

  return <div className={cn("w-full", className)}>{children}</div>;
}

interface WizardNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onFinish?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  finishLabel?: string;
  showPrevious?: boolean;
  showNext?: boolean;
  isNextDisabled?: boolean;
  isPreviousDisabled?: boolean;
  className?: string;
  onClose: () => void;
}

export function WizardNavigation({
  onNext,
  onPrevious,
  nextLabel = "Volgende",
  previousLabel = "Vorige",
  finishLabel = "Voltooien",
  showPrevious = true,
  showNext = true,
  isNextDisabled = false,
  isPreviousDisabled = false,
  className,
  onClose,
}: WizardNavigationProps) {
  const { isFirstStep, isLastStep, goToNext, goToPrevious } = useWizard();

  const handleNext = () => {
    onNext?.();
    goToNext();
  };

  const handlePrevious = () => {
    onPrevious?.();
    goToPrevious();
  };

  return (
    <div className={cn("flex justify-between items-center pt-6", className)}>
      <div>
        {isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPreviousDisabled}
          >
            Annuleren
          </Button>
        )}
        {showPrevious && !isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isPreviousDisabled}
          >
            {previousLabel}
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {showNext && !isLastStep && (
          <Button type="button" onClick={handleNext} disabled={isNextDisabled}>
            {nextLabel}
          </Button>
        )}

        {isLastStep && (
          <SubmitButton disabled={isNextDisabled}>{finishLabel}</SubmitButton>
        )}
      </div>
    </div>
  );
}

interface WizardProgressProps {
  className?: string;
}

export function WizardProgress({ className }: WizardProgressProps) {
  const { currentStep, totalSteps } = useWizard();

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors",
                  {
                    "bg-primary text-primary-foreground": isCurrent,
                    "bg-secondary text-secondary-foreground": isCompleted,
                    "bg-muted text-muted-foreground": isUpcoming,
                  }
                )}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={cn("flex-1 h-0.5 mx-3", {
                    "bg-primary": stepNumber < currentStep,
                    "bg-muted": stepNumber >= currentStep,
                  })}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
