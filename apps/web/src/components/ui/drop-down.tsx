"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DropdownMenuDemo() {
  // state to track selected option
    const [selected, setSelected] = useState("Select Data Type")
    const buttonWidth = "w-56"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={buttonWidth}>{selected}</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>To import:</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setSelected("Members")}>
            Members
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelected("Events")}>
            Events
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelected("Event Attendance")}>
            Event Attendance
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelected("Applications")}>
            Applications
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
