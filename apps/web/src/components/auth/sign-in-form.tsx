"use client";

import { useActionState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { GalleryVerticalEnd } from "lucide-react";
import { toast } from "sonner";

import FormSubmitButton from "@/components/form-submit-button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInWithPassword, type AuthState } from "@/lib/actions";

type SignInValues = {
  email: string;
  password: string;
};

const initialState: AuthState = {
  error: undefined,
};

type SignInFormProps = {
  oauthError?: string;
};

const SignInForm = ({ oauthError }: SignInFormProps) => {
  const [state, formAction] = useActionState(
    signInWithPassword,
    initialState,
  );
  const searchParams = useSearchParams();

  const form = useForm<SignInValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  useEffect(() => {
    const queryError = searchParams.get("error");
    const resolvedError = oauthError ?? queryError;
    if (resolvedError === "not_authorized") {
      setTimeout(() => {
        toast.error("You are not authorized to use OAuth.");
      }, 0);
    }
  }, [oauthError, searchParams]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <span className="sr-only">Acme Inc.</span>
          </a>
          <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="underline underline-offset-4">
              Sign up
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-6">
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
                    placeholder="m@example.com"
                    autoComplete="email"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            rules={{ required: "Password is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    required
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between items-center">
                            {state?.error ? (
            <p className="text-xs text-destructive w-fit" role="alert">
              {state.error}
            </p>
          ) : <p />}
                  <a href="/reset-password" className="underline flex justify-end text-end underline-offset-4 text-xs">
              Forgot password?
            </a>
                </div>
              </FormItem>
            )}
          />
          <FormSubmitButton className="w-full" pendingText="Signing in...">
            Sign In
          </FormSubmitButton>

        </div>
      </form>
    </Form>
  );
};

export default SignInForm;
