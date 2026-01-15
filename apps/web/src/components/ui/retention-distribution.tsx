"use client"

import  ToggleBar  from "@/components/ui/toggle-bar"
import { RetentionStacked } from "@/components/ui/retention-stacked"
import { RetentionOverall } from "@/components/ui/retention-overall"
import { useState } from 'react'
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

export const description = "A bar chart"

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function RetentionDistributionChart() {
    //true = overall chart
    //false = stacked chart
    const [overallChart, setOverallChart] = useState(true)

    return(
        <div className=" flex flex-col justify-center gap-5 w-full">
             <div className="flex flex-col items-center">
                <ToggleBar
                    options={[
                        { label: 'Overall', value: 'overall' },
                        { label: 'By Major', value: 'by-major' },
                    ]}
                    onChange={(v) => {
                      if (v ==='overall'){
                        setOverallChart(true)
                      } else {
                        setOverallChart(false)
                      }
                     }
                    }
                    />  
             </div>
             
            <Card>
                  <CardHeader>
                    <CardTitle>Retention Distribution</CardTitle>
                    <CardDescription>Aug 2025 - Jan 2026</CardDescription>
                  </CardHeader>
                  {/*Only the card content in retention-overall and retention-stacked will be updated will real data */}
                  {overallChart 
                    ? <RetentionOverall></RetentionOverall>
                    : <RetentionStacked></RetentionStacked> 
                    }
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                  </CardFooter>
                </Card>


        </div>
        
    );
}