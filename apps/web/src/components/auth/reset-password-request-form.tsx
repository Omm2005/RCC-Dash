"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import FormSubmitButton from "@/components/form-submit-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { requestPasswordReset, type AuthState } from "@/lib/actions";

type FormValues = {
  email: string;
};

const initialState: AuthState = {
  error: undefined,
};

export function ResetPasswordRequestForm() {
  const [state, formAction] = useActionState(
    requestPasswordReset,
    initialState,
  );
  const form = useForm<FormValues>({
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success(state.success);
    }
  }, [state?.error, state?.success]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          rules={{ required: "Email is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {state?.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-sm text-emerald-600" role="status">
            {state.success}
          </p>
        )}
        <FormSubmitButton className="w-full" pendingText="Sending reset link...">
          Send reset link
        </FormSubmitButton>
      </form>
    </Form>
  );
}
