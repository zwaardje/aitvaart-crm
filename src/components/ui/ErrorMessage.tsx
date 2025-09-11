import { cn } from "@/lib/utils";

export interface ErrorMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string;
}

export function ErrorMessage({
  className,
  message,
  ...props
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <p className={cn("text-sm text-red-600", className)} {...props}>
      {message}
    </p>
  );
}
