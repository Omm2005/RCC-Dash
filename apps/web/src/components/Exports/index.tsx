"use client"

import ExportCSV from "./export-csv"
import ExportImage from "./export-image"
import { cn } from "@/lib/utils"

type ExportsProps = {
  isAdmin: boolean
  sidebar?: boolean
  classNames?: string
}

export default function Exports({
  isAdmin,
  sidebar = false,
  classNames,
}: ExportsProps) {
  if (!isAdmin) return null

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 sm:flex-row sm:items-center md:w-auto",
        sidebar && "mt-2",
        classNames
      )}
    >
      {
        isAdmin && (
          <>
          <ExportImage targetId="dashboard-export" />
          <ExportCSV />
          </>
        )
      }
    </div>
  )
}
