"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { SubmitButton } from "@/components/forms/SubmitButton";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
} from "@remixicon/react";

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

  // Handle dynamic totalSteps changes
  // If currentStep exceeds new totalSteps, adjust to the last valid step
  useEffect(() => {
    if (currentStep > totalSteps) {
      setCurrentStep(totalSteps);
    }
  }, [totalSteps, currentStep]);

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
  onClose?: () => void;
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
    <div
      className={cn("flex justify-between items-center pt-6 gap-4", className)}
    >
      {isFirstStep ||
        (showPrevious && (
          <div>
            {isFirstStep && onClose && (
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
                className="flex items-center gap-2"
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isPreviousDisabled}
              >
                <RiArrowLeftLine className="w-4 h-4" />
                {previousLabel}
              </Button>
            )}
          </div>
        ))}

      <div className="flex flex-1 gap-2">
        {showNext && !isLastStep && (
          <Button
            className="w-full flex items-center gap-2"
            type="button"
            onClick={handleNext}
            disabled={isNextDisabled}
          >
            {nextLabel}
            <RiArrowRightLine className="w-4 h-4" />
          </Button>
        )}

        {isLastStep && (
          <SubmitButton
            className="w-full flex items-center gap-2"
            disabled={isNextDisabled}
          >
            <RiCheckLine className="w-4 h-4" />
            {finishLabel}
          </SubmitButton>
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
    <div className={cn("mb-6 mt-6", className)}>
      <div className="flex items-center gap-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div
              key={stepNumber}
              className={cn("flex-1 h-1 rounded-md transition-colors", {
                "bg-primary": isActive || isCompleted,
                "bg-muted border border-primary/20 ": !isActive && !isCompleted,
              })}
            />
          );
        })}
      </div>
    </div>
  );
}
