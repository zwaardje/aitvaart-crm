"use client";

import { useFormContext, Controller } from "react-hook-form";
import { useId } from "react";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
  Label,
  ErrorMessage,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface FormSelectProps {
  name: string;
  label?: string;
  validation?: any;
  hint?: string;
  className?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export function FormSelect({
  name,
  label,
  validation,
  hint,
  className,
  placeholder,
  options,
  ...rest
}: FormSelectProps) {
  const {
    control,
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
      <Controller
        name={name}
        control={control}
        rules={validation}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger
              className={cn(
                "h-9 text-xs",
                error && "border-red-500 focus-visible:ring-red-500",
                className
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  className="text-xs"
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <ErrorMessage message={error} />
      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}
