import Link from "next/link";
import { ResetPasswordRequestForm } from "@/components/auth/reset-password-request-form";
import { ResetPasswordUpdateForm } from "@/components/auth/reset-password-update-form";
import { Button } from "@/components/ui/button";
import { createClient } from "@repo/supabase/server";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if (user) {
  //   redirect("/");
  // }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/signin">
            <HugeiconsIcon icon={ArrowLeft02Icon} />
            Back to sign in
            </Link>
          </Button>
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset password
          </h1>
          <p className="text-sm text-muted-foreground">
            {user
              ? "Choose a new password for your account."
              : "Send yourself a password reset link."}
          </p>
        </div>

        {user ? (
          <ResetPasswordUpdateForm />
        ) : (
          <ResetPasswordRequestForm />
        )}

        {!user && (
          <p className="text-center text-xs text-muted-foreground">
            Already have a reset link? Open it from your email to continue.
          </p>
        )}
      </div>
    </div>
  );
}
