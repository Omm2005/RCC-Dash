"use client"

import { TrendingUp } from "lucide-react"
import { ResponsiveContainer, LabelList, Pie, PieChart } from "recharts"
import  ToggleBar  from "@/components/ui/toggle-bar"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A pie chart with a label list"

//tooltip updated to match the values within browser, any label updated will update tooltip label
const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]

const chartConfig = {
  chrome: {
    label: "Freshman",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Sophomore",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Junior",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Senior",
    color: "var(--chart-4)",
  },
  other: {
    label: "Senior+",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function PieChartYear() {
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
            <Pie data={chartData} dataKey="visitors" nameKey="browser" isAnimationActive={false}>
              
              <LabelList
                dataKey="browser"
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
