"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  className?: string;
}

export function SubmitButton({
  children,
  variant = "default",
  size = "default",
  isLoading,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { formState } = useFormContext();

  const isDisabled = formState.isSubmitting || disabled;
  const loading = isLoading || formState.isSubmitting;

  return (
    <Button
      variant={variant}
      size={size}
      type="submit"
      className={cn("self-start", className)}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
      )}
      {children}
    </Button>
  );
}
