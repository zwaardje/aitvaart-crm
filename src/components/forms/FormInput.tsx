"use client";

import { useFormContext } from "react-hook-form";
import { useId } from "react";
import { Input, Label, ErrorMessage } from "@/components/ui";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  validation?: any;
  hint?: string;
  className?: string;
}

export function FormInput({
  name,
  label,
  validation,
  hint,
  className,
  ...rest
}: FormInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const inputId = useId();
  const error = errors[name]?.message as string;

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <Label htmlFor={inputId} className="text-xs text-muted-foreground">
          {label}
        </Label>
      )}
      <Input
        id={inputId}
        {...register(name, validation)}
        className={cn(
          "h-9 text-sm",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        {...rest}
      />
      <ErrorMessage message={error} />
      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}
