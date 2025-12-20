"use client";

import React, { useId, forwardRef, useEffect } from "react";
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
import { watch } from "fs";
import { useWizardErrorContext } from "./WizardErrorContext";

interface FormProps {
  defaultValues?: Record<string, any>;
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  onError?: (errors: any) => void;
  className?: string;
  schema?: z.ZodSchema<any>;
  serverErrors?: Error | string;
  isLoading?: boolean;
  id?: string;
  canWatch?: boolean;
  canWatchErrors?: boolean;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  {
    defaultValues,
    children,
    onSubmit,
    onError,
    className,
    schema,
    canWatch = false,
    canWatchErrors = false,
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

  const { handleSubmit, setError, formState, watch } = methods;
  const autoId = useId();
  const formId = id ?? autoId;
  const contextOnError = useWizardErrorContext();
  const effectiveOnError = onError || contextOnError;

  let formValues = {};
  if (canWatch) {
    formValues = watch();
  }

  const serializeErrors = (err: any): any => {
    if (!err) return undefined;
    if (Array.isArray(err)) {
      const arr = err.map(serializeErrors).filter((v) => v !== undefined);
      return arr.length ? arr : undefined;
    }
    if (typeof err === "object") {
      if ("message" in err || "type" in err || "types" in err) {
        const { type, message, types } = err as any;
        return { type, message, ...(types ? { types } : {}) };
      }
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(err)) {
        const val = serializeErrors(v);
        if (val !== undefined) out[k] = val;
      }
      return Object.keys(out).length ? out : undefined;
    }
    return undefined;
  };

  const getSerializableErrors = () => {
    return serializeErrors(formState.errors) ?? {};
  };

  // Handle server errors
  useEffect(() => {
    if (serverErrors) {
      setError("root", {
        message:
          typeof serverErrors === "string"
            ? serverErrors
            : serverErrors.message || "common.error",
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
        onSubmit={handleSubmit(onSubmit, effectiveOnError)}
        className={cn("flex w-full flex-col gap-4 p-2", className)}
        noValidate
      >
        {/* for debugging */}
        {canWatch && <pre>{JSON.stringify(formValues, null, 2)}</pre>}

        {/* for debugging */}
        {canWatchErrors && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-800">Form Errors:</h3>
            <pre className="text-red-600 text-xs">
              {JSON.stringify(getSerializableErrors(), null, 2)}
            </pre>
          </div>
        )}

        {globalErrors && (
          <Alert variant="destructive">{globalErrors.message}</Alert>
        )}
        {children}
      </form>
    </FormProvider>
  );
});

Form.displayName = "Form";
