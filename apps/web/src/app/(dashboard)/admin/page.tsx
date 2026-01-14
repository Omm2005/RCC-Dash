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
    <main className="flex h-full w-full items-center flex-col justify-center gap-4 p-32">
      <div className="">
        
        <div className="flex flex-col mb-5 gap-5">
          <h1 className="text-3xl font-semibold">Admin Page</h1>
        </div>
            <div>
                <div className="flex flex-col gap-10">
                    <div className="">
                        <h2 className="font-bold">Import Data</h2>
                    </div>
                    <div className="flex flex-row gap-20">
                        <div className="flex flex-col gap-5">
                            <h3>What are you importing?</h3>
                            <DropdownMenuDemo></DropdownMenuDemo>
                        </div>

                        <div className="flex flex-col gap-5">
                            <h3>Upload CSV File</h3>
                            <UploadArea></UploadArea>
                        </div>
                    <ImportButton></ImportButton>
                </div> 
            <div>
        </div>

            <div className="flex flex-col w-full gap-20 ">
                <div className="flex flex-row gap-20">
                    <div className="flex flex-[1] flex-col gap-5">
                        <h3 className="font-bold" >Validation Summary</h3>
                        <div className="flex-1">
                            <TextCard desc={"Rows Valid: \n\n Rows with Errors:"} />
                        </div>
                    </div>

                    <div className="flex flex-[1] flex-col gap-5">
                        <h3 className="font-bold" >Success Summary</h3>
                        <div className="flex-1">
                            <TextCard desc={"Rows Imported: \n\n Rows Skipped:"} />
                        </div>
                    </div>
            </div>
            </div>
            <EventForm />
            </div>
        </div>
      </div>
    </main>
  );
}
