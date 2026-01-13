import { createClient } from "@repo/supabase/server";
import { redirect } from "next/navigation";
import { DropdownMenuDemo } from "@/components/ui/drop-down"
import { ImportButton } from "@/components/ui/import-button"
import UploadArea from "@/components/ui/csvupload"
import { EventForm } from "@/components/ui/event-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/signin");
  }

  return (
    <main className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Admin</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Keep imports and event entry organized in one place.
        </p>
      </header>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="w-full sm:w-auto" variant="line">
          <TabsTrigger value="import">Import data</TabsTrigger>
          <TabsTrigger value="event">New event</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
            <section className="rounded-xl border bg-card p-4 sm:p-6 flex flex-col">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold">Import data</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a dataset and upload a CSV.
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Dataset
                  </p>
                  <DropdownMenuDemo />
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Upload
                  </p>
                  <UploadArea />
                </div>

                <div className="flex w-full">
                  <ImportButton />
                </div>
              </div>
            </section>

            <aside className="rounded-xl border bg-muted/30 p-4 text-sm">
              <h3 className="text-sm font-semibold">Latest import</h3>
              <div className="mt-3 grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rows valid</span>
                  <span className="font-medium text-foreground">—</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rows with errors</span>
                  <span className="font-medium text-foreground">—</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rows imported</span>
                  <span className="font-medium text-foreground">—</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rows skipped</span>
                  <span className="font-medium text-foreground">—</span>
                </div>
              </div>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="event" className="mt-4 flex justify-center items-center">
          <section className="rounded-xl border bg-card p-4 sm:p-6 max-w-4xl">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">Create event</h2>
              <p className="text-sm text-muted-foreground">
                Log a single event without leaving the dashboard.
              </p>
            </div>
            <div className="mt-4">
              <EventForm />
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </main>
  );
}
