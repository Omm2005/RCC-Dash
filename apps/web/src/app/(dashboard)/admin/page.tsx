import { createClient } from "@repo/supabase/server";
import { redirect } from "next/navigation";
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
    <main className="flex w-full flex-col gap-8 p-4 sm:p-6 lg:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Admin Page</h1>
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold">Import Data</h2>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,auto)]">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              What are you importing?
            </h3>
            <DropdownMenuDemo />
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Upload CSV File
            </h3>
            <UploadArea />
          </div>

          <div className="flex w-full items-end">
            <ImportButton />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold">Validation Summary</h3>
          <TextCard desc={"Rows Valid: \n\n Rows with Errors:"} />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold">Success Summary</h3>
          <TextCard desc={"Rows Imported: \n\n Rows Skipped:"} />
        </div>
      </section>

      <section>
        <EventForm />
      </section>
    </main>
  );
}
