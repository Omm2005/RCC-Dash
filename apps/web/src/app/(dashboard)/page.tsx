import SignOutButton from "@/components/SignOutButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@repo/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/signin");
  }

  return (
    <main className="flex h-full w-full bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8 md:px-10 md:py-12">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold leading-tight">RCC Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            You&apos;re signed in. Review your session details and sign out when you&apos;re done.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Session details</CardTitle>
              <CardDescription>Current authenticated user</CardDescription>
            </div>
            <div className="w-full max-w-xs md:w-auto">
              <SignOutButton className="w-full" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="break-all text-base font-medium text-foreground">
                {user.email}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="break-all text-base font-medium text-foreground">
                {user.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
