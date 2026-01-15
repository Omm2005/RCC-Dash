"use client"

import { TrendingUp } from "lucide-react"
import { ResponsiveContainer, LabelList, Pie, PieChart } from "recharts"
import  ToggleBar  from "@/components/ui/toggle-bar"
import { PieChartYear } from  "@/components/ui/pie-chart-year"
import { PieChartMajor } from  "@/components/ui/pie-chart-major"
import { useState } from 'react'

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

const chartData = [
  { browser: "Technical", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "Business", visitors: 200, fill: "var(--color-safari)" },
  { browser: "Humanities & Arts", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "Other/Unknown", visitors: 173, fill: "var(--color-edge)" },
]

const chartConfig = {
  chrome: {
    label: "TECH",
    color: "var(--chart-1)",
  },
  safari: {
    label: "BUS",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "H&A",
    color: "var(--chart-3)",
  },
  edge: {
    label: "O/U",
    color: "var(--chart-4)",
  },
  
} satisfies ChartConfig

export function ChartPieLabelList() {
  const [majorChart, setMajorChart] = useState(true)

  return (
    <ResponsiveContainer width="100%" height="100%">
    <Card className="flex flex-col h-full justify-between">
      <div>
        <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Label List</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      </div>
        
        <div className="flex justify-center">
        <ToggleBar
          options={[
            { label: 'Major', value: 'major' },
            { label: 'Year', value: 'year' },
          ]}
            onChange={(v) => {
                      if (v ==='major'){
                        setMajorChart(true)
                      } else {
                        setMajorChart(false)
                      }
                     }
                    }        />
      </div>
       {majorChart 
          ? <PieChartMajor></PieChartMajor>
          : <PieChartYear></PieChartYear> 
          }
      
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
    </ResponsiveContainer>
  )
}
