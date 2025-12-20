"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface WizardErrorContextType {
  onError?: (errors: any) => void;
}

const WizardErrorContext = createContext<WizardErrorContextType | undefined>(
  undefined
);

export function WizardErrorProvider({
  children,
  onError,
}: {
  children: ReactNode;
  onError?: (errors: any) => void;
}) {
  return (
    <WizardErrorContext.Provider value={{ onError }}>
      {children}
    </WizardErrorContext.Provider>
  );
}

export function useWizardErrorContext() {
  const context = useContext(WizardErrorContext);
  return context?.onError;
}
