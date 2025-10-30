"use client";

import React, { useId, forwardRef } from "react";
import {
  useForm,
  FormProvider,
  SubmitHandler,
  DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/Alert";

interface FormProps {
  defaultValues?: Record<string, any>;
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  className?: string;
  schema?: z.ZodSchema<any>;
  serverErrors?: Error;
  isLoading?: boolean;
  id?: string;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  {
    defaultValues,
    children,
    onSubmit,
    className,
    schema,
    serverErrors,
    isLoading = false,
    id,
  }: FormProps,
  ref: React.Ref<HTMLFormElement>
) {
  const methods = useForm({
    defaultValues,
    mode: "onSubmit",
    resolver: schema ? zodResolver(schema as any) : undefined,
  });

  const { handleSubmit, setError, formState } = methods;
  const autoId = useId();
  const formId = id ?? autoId;

  // Handle server errors
  React.useEffect(() => {
    if (serverErrors) {
      setError("root", {
        message: serverErrors.message || "common.error",
        type: "server",
      });
    }
  }, [serverErrors, setError]);

  const globalErrors = React.useMemo(() => {
    return formState.errors.root;
  }, [formState.errors.root]);

  return (
    <FormProvider {...methods}>
      <form
        ref={ref}
        id={formId}
        onSubmit={handleSubmit(onSubmit)}
        className={cn("flex w-full flex-col gap-4 p-2", className)}
        noValidate
      >
        {globalErrors && (
          <Alert variant="destructive" className="mb-4">
            {globalErrors.message}
          </Alert>
        )}
        {children}
      </form>
    </FormProvider>
  );
});

Form.displayName = "Form";
