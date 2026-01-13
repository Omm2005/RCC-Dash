import { createClient } from "@repo/supabase/server";
import { redirect } from "next/navigation";
import { ChartLineMultiple } from "@/components/ui/line-graph"
import { ChartPieLabelList } from "@/components/ui/pie-chart"
import { ChartBarStacked } from "@/components/ui/stacked-bar-chart"
import { ChartBarHorizontal } from "@/components/ui/ChartBarHorizontal";
import { BigNumber } from "@/components/ui/kpi"

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/signin");
  }
  return (
    <main className="flex w-full flex-col gap-6 p-4 sm:p-6 lg:p-10">
      <div className="w-full">
        <div id="dashboard-export" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold sm:text-3xl">
              RCC Engagement Dashboard
            </h1>
            <h3 className="text-sm text-muted-foreground sm:text-base">
              Overview & Growth
            </h3>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <BigNumber />
            <BigNumber />
            <BigNumber />
            <BigNumber />
          </div>
          <div className="w-full">
            <ChartLineMultiple />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ChartPieLabelList />
            </div>
            <div className="lg:col-span-2">
              <ChartBarStacked />
            </div>
          </div>
          <div className="w-full">
            <ChartBarHorizontal />
          </div>
        </div>
      </div>
    </main>
  );
}
