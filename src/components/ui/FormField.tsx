import { Label } from "./label";
import { ErrorMessage } from "./ErrorMessage";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <Label
          htmlFor={
            typeof children === "object" && children && "props" in children
              ? children.props.id
              : undefined
          }
        >
          {label}
        </Label>
      )}
      {children}
      <ErrorMessage message={error} />
    </div>
  );
}
