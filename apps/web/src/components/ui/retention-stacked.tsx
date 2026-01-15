"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
  { month: "January", Technical: 186, Business: 80, handa: 50, HealthSciences: 50, other: 30 },
  { month: "February", Technical: 305, Business: 120, handa: 70, HealthSciences: 50, other: 40 },
  { month: "March", Technical: 237, Business: 90, handa: 60, HealthSciences: 50, other: 25 },
  { month: "April", Technical: 73, Business: 50, handa: 20, HealthSciences: 50, other: 15 },
  { month: "May", Technical: 209, Business: 130, handa: 80, HealthSciences: 50, other: 40 },
  { month: "June", Technical: 214, Business: 140, handa: 90, HealthSciences: 50, other: 50 },
]

const chartConfig = {
  Technical: {
    label: "Technical",
    color: "var(--chart-1)",
  },
  Business: {
    label: "Business",
    color: "var(--chart-2)",
  },
  handa: {
    label: "Humanities and Arts",
    color: "var(--chart-3)",
  },
  HealthSciences: {
    label: "Health Science",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function RetentionStacked() {
  const keys = Object.keys(chartConfig) // ['desktop', 'Business', 'handa', 'other']

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
          <YAxis className="pr-2 " axisLine={false}/>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <ChartLegend content={<ChartLegendContent />} />

          {keys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={chartConfig[key as keyof typeof chartConfig].color}
              name={key} 
              radius={index === keys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>
      <CardFooter className="flex-col gap-2 text-sm">
        
      </CardFooter>
    </CardContent>
  )
}
