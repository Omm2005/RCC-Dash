"use client"

import { TrendingUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function BigNumber() {
  const value = 1224 // ← replace with dynamic data later

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Visitors</CardTitle>
        <CardDescription>January – June 2024</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="text-4xl font-bold tracking-tight sm:text-5xl">
          {value.toLocaleString()}
        </div>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
