"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function BigNumber({ title, date, trending }: { title: string, date: string, trending: boolean }) {  
  const value = 1224 
  
  // replace with actual growth (True: Green, False: Red)
  const growth = true

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{date}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="text-5xl font-bold tracking-tight">
          {value.toLocaleString()}
        </div>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        {trending ? <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month {growth ? <TrendingUp className="h-4 w-4 text-green-700" /> : <TrendingDown className="h-4 w-4 text-red-700" />}
        </div> : <div></div>}
        
      </CardFooter>
    </Card>
  )
}
