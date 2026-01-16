import { createClient } from "@repo/supabase/server";
import { redirect } from "next/navigation";
import { ChartLineMultiple } from "@/components/ui/line-graph"
import { ChartPieLabelList } from "@/components/ui/pie-chart"
import { ChartBarStacked } from "@/components/ui/stacked-bar-chart"
import { BigNumber } from "@/components/ui/kpi"
import { RetentionDistributionChart } from "@/components/ui/retention-distribution"

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/signin");
  }
  return (
    <main className="flex w-full flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold sm:text-3xl">
                    RCC Engagement Dashboard
                </h1>
            </div>
          <h3 className="text-sm font-medium text-muted-foreground sm:text-base">
            Overview & Growth
          </h3>
        </div>

        <div className="flex flex-col gap-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <BigNumber />
            <BigNumber />
            <BigNumber />
            <BigNumber />
          </div>

          <div className="min-w-0">
            <ChartLineMultiple />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-1">
              <ChartPieLabelList />
            </div>
            <div className="min-w-0 lg:col-span-2">
              <ChartBarStacked />
            </div>
          </div>

          <div className="min-w-0">
            <RetentionDistributionChart />
          </div>
        </div>
      </div>
    </main>
  );
}
