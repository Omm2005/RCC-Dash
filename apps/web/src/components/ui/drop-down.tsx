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

export type ImportType = "Event Attendance" | "Applications" | null;
/**
 * value: controlled by parent
 * onChange: function parent gives us to update value
 */
type DropdownMenuDemoProps = {
  value: ImportType;
  onChange: (value: ImportType) => void;
}

export function DropdownMenuDemo({ value, onChange } : DropdownMenuDemoProps) {
  // state to track selected option
  const buttonWidth = "w-56"
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={buttonWidth}>
          {value ?? "Select Data Type"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuLabel>To import:</DropdownMenuLabel>
        <DropdownMenuGroup>
          {/* 
            Each item calls onChange(...)
            State updated in PARENT (AdminImportPanel)
          */}
          <DropdownMenuItem onClick={() => onChange("Event Attendance")}>
            Event Attendance
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange("Applications")}>
            Applications
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
