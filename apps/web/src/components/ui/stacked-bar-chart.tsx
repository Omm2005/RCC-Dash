"use client"

import  ToggleBar  from "@/components/ui/toggle-bar"
import { RetentionStacked } from "@/components/ui/retention-stacked"
import { RetentionOverall } from "@/components/ui/retention-overall"
import { useState } from 'react'
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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

export function ChartBarStacked() {

    return(
        <div className=" flex flex-col justify-center gap-5 w-full h-full items-stretch">
            
            <Card className="h-full items-stretch justify-between">
                  <CardHeader>
                    <CardTitle>Every Event</CardTitle>
                    <CardDescription>Overall attendance patterns</CardDescription>
                  </CardHeader>

                  {/*Only the card content in retention-overall and retention-stacked will be updated will real data */}
                    <RetentionStacked></RetentionStacked> 
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    
                  </CardFooter>
                </Card>


        </div>
        
    );
}