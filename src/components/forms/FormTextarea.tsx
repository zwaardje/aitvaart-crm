"use client";

import { useFormContext } from "react-hook-form";
import { useId } from "react";
import { Textarea, Label, ErrorMessage } from "@/components/ui";
import { cn } from "@/lib/utils";

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  validation?: any;
  hint?: string;
  className?: string;
}

export function FormTextarea({
  name,
  label,
  validation,
  hint,
  className,
  ...rest
}: FormTextareaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const inputId = useId();
  const error = errors[name]?.message as string;

  return (
    <div className={cn("space-y-1", className)}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <Textarea
        id={inputId}
        {...register(name, validation)}
        className={cn(
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
