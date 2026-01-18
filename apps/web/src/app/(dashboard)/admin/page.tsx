import { createClient } from "@repo/supabase/server";
import { redirect } from "next/navigation";
import AdminImportPanel from "@/components/admin/AdminImportPanel";
import { getUserRole } from "@/lib/actions";


export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/signin");
  }

const result = await getUserRole();

if(!result) {
  return redirect("/");
}

const { data } = result;

  if (data && data.role !== "admin") {
    return redirect("/");
  }

  return (
    <main className="flex w-full flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <AdminImportPanel />
      </div>
    </main>
  );
}
