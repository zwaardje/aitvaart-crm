"use client";

import { useFormContext } from "react-hook-form";
import { useId } from "react";
import { Label, ErrorMessage } from "@/components/ui";
import { cn } from "@/lib/utils";

interface FormRadioGroupProps {
  name: string;
  label?: string;
  validation?: any;
  hint?: string;
  className?: string;
  options: { label: string; value: string | number }[];
}

export function FormRadioGroup({
  name,
  label,
  validation,
  hint,
  className,
  options,
  ...rest
}: FormRadioGroupProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const groupId = useId();
  const error = errors[name]?.message as string;

  return (
    <div className={cn("space-y-1", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex flex-col items-start gap-2">
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          return (
            <div key={String(option.value)} className="flex items-center gap-2">
              <input
                type="radio"
                id={optionId}
                value={String(option.value)}
                {...register(name, validation)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                {...rest}
              />
              <Label htmlFor={optionId} className="text-sm font-normal">
                {option.label}
              </Label>
            </div>
          );
        })}
      </div>
      <ErrorMessage message={error} />
      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}
