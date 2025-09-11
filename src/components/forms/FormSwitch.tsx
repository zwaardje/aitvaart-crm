"use client";

import { useFormContext, Controller } from "react-hook-form";
import { useId } from "react";
import { Switch, Label, ErrorMessage } from "@/components/ui";
import { cn } from "@/lib/utils";

interface FormSwitchProps {
  name: string;
  label?: string;
  validation?: any;
  hint?: string;
  className?: string;
}

export function FormSwitch({
  name,
  label,
  validation,
  hint,
  className,
  ...rest
}: FormSwitchProps) {
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
          <Switch
            checked={field.value ?? false}
            onCheckedChange={field.onChange}
            {...rest}
          />
        )}
      />
      {label && <Label htmlFor={inputId}>{label}</Label>}
      {error && <ErrorMessage message={error} />}
      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}
