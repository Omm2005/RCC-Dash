"use client"

import { TrendingUp } from "lucide-react"
import { ResponsiveContainer } from "recharts"
import ToggleBar from "@/components/ui/toggle-bar"
import { PieChartYear } from "@/components/ui/pie-chart-year"
import { PieChartMajor } from "@/components/ui/pie-chart-major"
import { useState } from "react"

import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const description = "Members by Major Category"

// Example chart config for the legend
const chartConfig = {
  Technical: { label: "Technical", shortLabel: "TECH", color: "var(--chart-1)" },
  Business: { label: "Business", shortLabel: "BUS", color: "var(--chart-2)" },
  HumanitiesAndArts: { label: "Humanities/Arts", shortLabel: "H&A", color: "var(--chart-3)" },
  HealthSciences: { label: "Health Sciences", shortLabel: "HS", color: "var(--chart-4)" },
  Other: { label: "Other", shortLabel: "O/U", color: "var(--chart-5)" },

} as const

const chartConfigYears = {
  Freshman: { label: "Freshman", shortLabel: "TECH", color: "var(--chart-1)" },
  Sophomore: { label: "Sophomore", shortLabel: "BUS", color: "var(--chart-2)" },
  Junior: { label: "Junior", shortLabel: "H&A", color: "var(--chart-3)" },
  Senior: { label: "Senior", shortLabel: "HS", color: "var(--chart-4)" },
  SeniorPlus: { label: "Senior+", shortLabel: "O/U", color: "var(--chart-5)" },

} as const

export function ChartPieLabelList() {
  const [majorChart, setMajorChart] = useState(true)
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Card className="flex flex-col h-full justify-between">
        <CardHeader className="items-center pb-0">
          <CardTitle>Members by Major Category</CardTitle>
          <CardDescription>Aug 2025 - Jan 2026</CardDescription>
        </CardHeader>

        <div className="flex justify-center">
          <ToggleBar
            options={[
              { label: "Major", value: "major" },
              { label: "Year", value: "year" },
            ]}
            onChange={(v) => setMajorChart(v === "major")}
          />
        </div>

        {majorChart ? <PieChartMajor /> : <PieChartYear />}

        <CardFooter className="flex flex-col gap-3 text-sm">
          {majorChart ? <MajorLegend /> : <YearLegend />}
          
          
        </CardFooter>
      </Card>
    </ResponsiveContainer>
  )
}

export function MajorLegend() {
  const legendItems = Object.values(chartConfig)
  return(
  <div className="flex flex-wrap justify-center gap-4 mt-2">
    {legendItems.map((item) => (
      <div key={item.label} className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: item.color }}
        />
        <span className="font-medium">{item.label}</span>
      </div>
    ))}
  </div>
  );
}
  export function YearLegend() {
  const legendItems = Object.values(chartConfigYears)
  return(
  <div className="flex flex-wrap justify-center gap-4 mt-2">
    {legendItems.map((item) => (
      <div key={item.label} className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: item.color }}
        />
        <span className="font-medium">{item.label}</span>
      </div>
    ))}
  </div>
  );
}