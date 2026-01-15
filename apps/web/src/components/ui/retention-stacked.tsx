"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A stacked bar chart with a legend"

const chartData = [
  { month: "January", desktop: 186, business: 80, handa: 50, other: 30 },
  { month: "February", desktop: 305, business: 120, handa: 70, other: 40 },
  { month: "March", desktop: 237, business: 90, handa: 60, other: 25 },
  { month: "April", desktop: 73, business: 50, handa: 20, other: 15 },
  { month: "May", desktop: 209, business: 130, handa: 80, other: 40 },
  { month: "June", desktop: 214, business: 140, handa: 90, other: 50 },
]

const chartConfig = {
  desktop: {
    label: "TECH",
    color: "var(--chart-1)",
  },
  business: {
    label: "BUS",
    color: "var(--chart-2)",
  },
  handa: {
    label: "H&A",
    color: "var(--chart-3)",
  },
  other: {
    label: "O/U",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function RetentionStacked() {
  const keys = Object.keys(chartConfig) // ['desktop', 'business', 'handa', 'other']

  return (
    <CardContent>
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <ChartLegend content={<ChartLegendContent />} />

          {keys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={chartConfig[key as keyof typeof chartConfig].color}
              radius={index === keys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </CardContent>
  )
}
