"use client"

import { LabelList, Pie, PieChart } from "recharts"
import { CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A pie chart with a label list"

const chartData = [
  { major: "Technical", visitors: 186, fill: "var(--color-Technical)" },
  { major: "Business", visitors: 130, fill: "var(--color-Business)" },
  { major: "HumanitiesAndArts", visitors: 90, fill: "var(--color-HumanitiesAndArts)" },
  { major: "HealthSciences", visitors: 50, fill: "var(--color-HealthSciences)" },
  { major: "Other", visitors: 40, fill: "var(--color-Other)" },
]

const chartConfig = {
  Technical: {
    label: "Tech",
    color: "var(--chart-1)",
  },
  Business: {
    label: "Bus",
    color: "var(--chart-2)",
  },
  HumanitiesAndArts: {
    label: "H/Arts",
    color: "var(--chart-3)",
  },
  HealthSciences: {
    label: "Health",
    color: "var(--chart-4)",
  },
  Other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function PieChartMajor() {
  return (
    <CardContent className="flex-1 pb-0">
      <ChartContainer
        config={chartConfig}
        className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie data={chartData} dataKey="visitors" nameKey="major" isAnimationActive={false}>
            <LabelList
              dataKey="major"
              className="fill-background"
              stroke="none"
              fontSize={12}
              formatter={(value: keyof typeof chartConfig) =>
                chartConfig[value]?.label
              }
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </CardContent>
  )
}