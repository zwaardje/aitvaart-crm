"use client";

import { useFormContext, Controller } from "react-hook-form";
import { useId } from "react";
import { Checkbox, Label, ErrorMessage } from "@/components/ui";
import { cn } from "@/lib/utils";

interface FormCheckboxProps {
  name: string;
  label?: string;
  validation?: any;
  hint?: string;
  className?: string;
  disabled?: boolean;
}

export function FormCheckbox({
  name,
  label,
  validation,
  hint,
  className,
  disabled,
}: FormCheckboxProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const inputId = useId();
  const error = errors[name]?.message as string;

  return (
    <div className={cn("flex flex-row items-center gap-2", className)}>
      <Controller
        name={name}
        control={control}
        rules={validation}
        render={({ field }) => (
          <Checkbox
            id={inputId}
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
        )}
      />
      {label && (
        <Label className="text-xs" htmlFor={inputId}>
          {label}
        </Label>
      )}
      {error && <ErrorMessage message={error} />}
      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}
