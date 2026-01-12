"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, Legend } from "recharts"

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

export const description = "A multiple line chart"

const chartData = [
  { month: "January", registered: 186, active: 80 },
  { month: "February", registered: 305, active: 200 },
  { month: "March", registered: 237, active: 120 },
  { month: "April", registered: 73, active: 190 },
  { month: "May", registered: 209, active: 130 },
  { month: "June", registered: 214, active: 140 },
]

const chartConfig = {
  registered: {
    label: "Registered",
    color: "var(--chart-1)",
  },
  active: {
    label: "Active",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartLineMultiple() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart - Multiple</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Legend /> 
            <Line
              dataKey="registered"
              type="monotone"
              name={chartConfig.registered.label} 
              stroke={chartConfig.registered.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="active"
              type="monotone"
              name={chartConfig.active.label} 
              stroke={chartConfig.active.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing total visitors for the last 6 months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
