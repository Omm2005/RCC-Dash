import { createClient } from "@repo/supabase/server";
import { redirect } from "next/navigation";
import AdminImportPanel from "@/components/admin/AdminImportPanel";
import { DropdownMenuDemo } from "@/components/ui/drop-down"
import { TextCard } from "@/components/ui/text-card"
import { ImportButton } from "@/components/ui/import-button"
import UploadArea from "@/components/ui/csvupload"
import { EventForm } from "@/components/ui/event-form"


export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/signin");
  }

  return (
    <main className="flex h-full w-full flex-col gap-6 p-10">
      <h1 className="text-3xl font-semibold">Admin Page</h1>
      <AdminImportPanel />
    </main>
  );
}
