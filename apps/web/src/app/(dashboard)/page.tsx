import { ResponsiveContainer } from "recharts";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@repo/supabase/server";
import { redirect } from "next/navigation";
import { CardContent } from "@/components/ui/card";
import { ChartBarDefault } from "@/components/ui/bar-chart";
import { ChartLineMultiple } from "@/components/ui/line-graph"
import { ChartPieLabelList } from "@/components/ui/pie-chart"
import { ChartBarStacked } from "@/components/ui/stacked-bar-chart"
import { ChartBarHorizontal } from "@/components/ui/ChartBarHorizontal";

export default async function Page() {
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
          <h1 className="text-3xl font-semibold">RCC Engagement Dashboard</h1>
          <h3>
            Overview & Growth
          </h3>
        </div>

        <div className="items-center">

        
        <div className="flex flex-col gap-20 items-center">
          <div className="flex flex-row gap-20">
            <ChartBarDefault></ChartBarDefault>
            <ChartBarDefault></ChartBarDefault>
            <ChartBarDefault></ChartBarDefault>
          </div>
        
          <div className="w-full">
            <ChartLineMultiple></ChartLineMultiple>
          </div>
          
          <div className="w-full flex justify-center">
          <div className="flex gap-8 w-full ">
            <div className="flex-[1] h-full">
              <ChartPieLabelList />
            </div>
            <div className="flex-[2] h-full">
              <ChartBarStacked />
            </div>
          </div>
        </div>

          <div className="w-full">
            <ChartBarHorizontal>
            </ChartBarHorizontal>
          </div>
        </div>
      </div>
      </div>
    
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
