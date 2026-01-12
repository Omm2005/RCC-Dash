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
import { updatePassword, type AuthState } from "@/lib/actions";
import { redirect } from "next/navigation";

type FormValues = {
  password: string;
  confirmPassword: string;
};

const initialState: AuthState = {
  error: undefined,
};

export function ResetPasswordUpdateForm() {
  const [state, formAction] = useActionState(updatePassword, initialState);
  const form = useForm<FormValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success(state.success);
      return redirect("/signin");
    }
  }, [state?.error, state?.success]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          rules={{ required: "New password is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          rules={{ required: "Please confirm your password" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
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
        <FormSubmitButton className="w-full" pendingText="Updating password...">
          Update password
        </FormSubmitButton>
      </form>
    </Form>
  );
}
