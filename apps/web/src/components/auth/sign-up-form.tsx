"use client";

import { useActionState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { GalleryVerticalEnd } from "lucide-react";
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
import { signUpWithPassword, type AuthState } from "@/lib/actions";
import { redirect } from "next/navigation";

type SignUpValues = {
  email: string;
  password: string;
  displayName: string;
};

const initialState: AuthState = {
  error: undefined,
  success: undefined,
};

type SignUpFormProps = {
  oauthError?: string;
};

const SignUpForm = ({ oauthError }: SignUpFormProps) => {
  const [state, formAction] = useActionState(
    signUpWithPassword,
    initialState,
  );
  const searchParams = useSearchParams();
  const form = useForm<SignUpValues>({
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
    },
  });

  useEffect(() => {
    if (state?.error) {
      if(state.error === `insert or update on table "profiles" violates foreign key constraint "profiles_user_id_fkey"`) {
        toast.error("An account with this email already exists.");
        return redirect("/signin");
      } else {
        toast.error(state.error);
        return;
      }
    }

    if (state?.success) {
      toast.info(state.success);
      return redirect("/signin");
    }
  }, [state?.error, state?.success]);

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
            Already have an account?{" "}
            <a href="/signin" className="underline underline-offset-4">
              Log in
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="displayName"
            rules={{ required: "Display name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="How should we call you?"
                    autoComplete="name"
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
                <FormMessage />
              </FormItem>
            )}
          />
          {state?.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <FormSubmitButton className="w-full" pendingText="Creating account...">
            Sign Up
          </FormSubmitButton>
        </div>
      </form>
    </Form>
  );
};

export default SignUpForm;
