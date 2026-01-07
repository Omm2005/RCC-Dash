
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@RCC-Dash/supabase/server";
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
    <main className="flex h-full w-full flex-col items-center justify-center gap-4 p-24">
      <h1 className="text-3xl font-semibold">RCC Dashboard</h1>
      {user ? (
        <div className="flex flex-col items-center gap-1 text-sm text-neutral-700">
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p className="break-all text-center">
            <span className="font-medium">User ID:</span> {user.id}
          </p>
          <SignOutButton className="mt-4" />
        </div>
      ) : (
        <p className="text-neutral-500">No user session found.</p>
      )}
    </main>
  );
}
