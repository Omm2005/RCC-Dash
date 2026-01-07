"use client";

import { signOut } from "@/lib/actions";
import { cn } from "@/lib/utils";
import FormSubmitButton from "./form-submit-button";

type Props = {
  className?: string;
};

const SignOutButton = ({ className }: Props) => {
  return (
    <form action={signOut} className="w-full">
      <FormSubmitButton
        className={cn("w-full", className)}
        pendingText="Signing out..."
      >
        Sign out
      </FormSubmitButton>
    </form>
  );
};

export default SignOutButton;
