"use client"

import { Pie, PieChart, Cell } from "recharts"
import { CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export const description = "A responsive pie chart with a legend under the chart"

const chartData = [
  { major: "Technical", value: 186 },
  { major: "Business", value: 130 },
  { major: "HumanitiesAndArts", value: 90 },
  { major: "HealthSciences", value: 50 },
  { major: "Other", value: 40 },
]

type ChartItem = {
  label: string
  shortLabel: string
  color: string
}

type ChartConfig = Record<string, ChartItem>

const chartConfig: ChartConfig = {
  Technical: {
    label: "Technical",
    shortLabel: "TECH",
    color: "var(--chart-1)",
  },
  Business: {
    label: "Business",
    shortLabel: "BUS",
    color: "var(--chart-2)",
  },
  HumanitiesAndArts: {
    label: "Humanities & Arts",
    shortLabel: "H&A",
    color: "var(--chart-3)",
  },
  HealthSciences: {
    label: "Health Sciences",
    shortLabel: "H&S",
    color: "var(--chart-4)",
  },
  Other: {
    label: "Other",
    shortLabel: "O/U",
    color: "var(--chart-5)",
  },
}

export function PieChartMajor() {
  return (
    <CardContent className="flex-1 pb-0">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="major"
            outerRadius="80%"
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.major}
                fill={chartConfig[entry.major].color}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </CardContent>
  )
}