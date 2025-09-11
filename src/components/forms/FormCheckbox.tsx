"use client";

import { useFormContext } from "react-hook-form";
import { useId } from "react";
import { Checkbox, Label, ErrorMessage } from "@/components/ui";
import { cn } from "@/lib/utils";

interface FormCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  name: string;
  label?: string;
  validation?: any;
  hint?: string;
  className?: string;
}

export function FormCheckbox({
  name,
  label,
  validation,
  hint,
  className,
  ...rest
}: FormCheckboxProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const inputId = useId();
  const error = errors[name]?.message as string;

  return (
    <div className={cn("flex flex-row items-center gap-2", className)}>
      <Checkbox id={inputId} {...register(name, validation)} {...rest} />
      {label && <Label htmlFor={inputId}>{label}</Label>}
      {error && <ErrorMessage message={error} />}
      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}
