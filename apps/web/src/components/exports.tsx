'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ExportDashboardButton from "@/components/export-dashboard-button"
import { FileSpreadsheet, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type AnalyticsPayload = {
  overview?: {
    kpis?: Record<string, number | string | null>
    members_over_time?: Array<Record<string, number | string | null>>
  }
  mission?: {
    major_category_distribution?: Array<Record<string, number | string | null>>
    class_year_distribution?: Array<Record<string, number | string | null>>
    event_major_category_percent?: Array<{
      event_id?: string | null
      event_title?: string | null
      starts_at?: string | null
      total_attendees?: number | null
      segments?: Array<{
        major_category?: string | null
        pct?: number | null
        count?: number | null
      }>
    }>
  }
  retention?: {
    attendance_count_distribution_overall?: Array<Record<string, number | string | null>>
    attendance_count_distribution_by_major_category?: Array<{
      major_category?: string | null
      distribution?: Array<Record<string, number | string | null>>
    }>
  }
}

type CsvTable = {
  filename: string
  rows: Array<Record<string, number | string | null>>
}

const escapeCsvValue = (value: unknown) => {
  if (value === null || value === undefined) return ""
  const asString = typeof value === "string" ? value : JSON.stringify(value)
  if (/[",\n]/.test(asString)) {
    return `"${asString.replace(/"/g, '""')}"`
  }
  return asString
}

const rowsToCsv = (rows: Array<Record<string, unknown>>) => {
  if (!rows.length) return ""
  const headers = Object.keys(rows[0])
  const lines = [headers.join(",")]
  for (const row of rows) {
    lines.push(headers.map((key) => escapeCsvValue(row[key])).join(","))
  }
  return `${lines.join("\n")}\n`
}

const downloadCsvTable = (table: CsvTable) => {
  const csv = rowsToCsv(table.rows)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = table.filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

const buildOverviewTables = (overview?: AnalyticsPayload["overview"]): CsvTable[] => {
  if (!overview) return []
  const tables: CsvTable[] = []
  if (overview.kpis) {
    tables.push({
      filename: "overview_kpis.csv",
      rows: Object.entries(overview.kpis).map(([metric, value]) => ({
        metric,
        value,
      })),
    })
  }
  if (overview.members_over_time?.length) {
    tables.push({
      filename: "overview_members_over_time.csv",
      rows: overview.members_over_time,
    })
  }
  return tables
}

const buildMissionTables = (mission?: AnalyticsPayload["mission"]): CsvTable[] => {
  if (!mission) return []
  const tables: CsvTable[] = []
  if (mission.major_category_distribution?.length) {
    tables.push({
      filename: "mission_major_category_distribution.csv",
      rows: mission.major_category_distribution,
    })
  }
  if (mission.class_year_distribution?.length) {
    tables.push({
      filename: "mission_class_year_distribution.csv",
      rows: mission.class_year_distribution,
    })
  }
  if (mission.event_major_category_percent?.length) {
    const rows: Array<Record<string, number | string | null>> = []
    for (const event of mission.event_major_category_percent) {
      for (const segment of event.segments ?? []) {
        rows.push({
          event_id: event.event_id ?? "",
          event_title: event.event_title ?? "",
          starts_at: event.starts_at ?? "",
          total_attendees: event.total_attendees ?? null,
          major_category: segment.major_category ?? "",
          pct: segment.pct ?? null,
          count: segment.count ?? null,
        })
      }
    }
    if (rows.length) {
      tables.push({
        filename: "mission_event_major_category_percent.csv",
        rows,
      })
    }
  }
  return tables
}

const buildRetentionTables = (retention?: AnalyticsPayload["retention"]): CsvTable[] => {
  if (!retention) return []
  const tables: CsvTable[] = []
  if (retention.attendance_count_distribution_overall?.length) {
    tables.push({
      filename: "retention_attendance_count_distribution_overall.csv",
      rows: retention.attendance_count_distribution_overall,
    })
  }
  if (retention.attendance_count_distribution_by_major_category?.length) {
    const rows: Array<Record<string, number | string | null>> = []
    for (const item of retention.attendance_count_distribution_by_major_category) {
      for (const entry of item.distribution ?? []) {
        rows.push({
          major_category: item.major_category ?? "",
          ...entry,
        })
      }
    }
    if (rows.length) {
      tables.push({
        filename: "retention_attendance_count_distribution_by_major_category.csv",
        rows,
      })
    }
  }
  return tables
}

const buildSectionTables = (
  analytics: AnalyticsPayload,
  section: "overview" | "mission" | "retention" | "all",
) => {
  if (section === "overview") return buildOverviewTables(analytics.overview)
  if (section === "mission") return buildMissionTables(analytics.mission)
  if (section === "retention") return buildRetentionTables(analytics.retention)
  return [
    ...buildOverviewTables(analytics.overview),
    ...buildMissionTables(analytics.mission),
    ...buildRetentionTables(analytics.retention),
  ]
}
    
export default function Exports({ isAdmin, sidebar = false, classNames }: { isAdmin: boolean, sidebar?: boolean, classNames?: string }) {
    const [isExporting, setIsExporting] = useState(false)

      const handleExport = async (
        section: "overview" | "mission" | "retention" | "all",
      ) => {
        try {
          setIsExporting(true)
          const response = await fetch("/api/analytics/dashboard", {
            method: "GET",
          })
          if (!response.ok) {
            throw new Error("Unable to load analytics data.")
          }
          const analytics = (await response.json()) as AnalyticsPayload
          const tables = buildSectionTables(analytics, section)
          if (!tables.length) {
            throw new Error("No data found for export.")
          }
          for (const table of tables) {
            downloadCsvTable(table)
          }
          toast.success("CSV export completed successfully")
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "CSV export failed."
          toast.error(message)
        } finally {
          setIsExporting(false)
        }
      }

      if(!isAdmin) return null

  return (
          <div className={`md:flex w-full flex-col gap-2 md:w-auto md:flex-row sm:items-center ${sidebar ? "mt-2" : ""} ${classNames}`}>
            <ExportDashboardButton targetId="dashboard-export" isAdmin={isAdmin} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  disabled={isExporting}
                  className={cn("w-full gap-2 hover:bg-accent hover:text-accent-foreground transition-colors sm:w-auto", sidebar && 'mt-2')}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Export CSV</span>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={sidebar ? "center" : "end"} className={cn(sidebar ? 'w-52': 'w-48')}>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  Dashboard Data
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    void handleExport("overview")
                  }}
                  disabled={isExporting}
                  className="gap-2 cursor-pointer"
                >
                  <span>Overview</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    void handleExport("mission")
                  }}
                  disabled={isExporting}
                  className="gap-2 cursor-pointer"
                >
                  <span>Mission</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    void handleExport("retention")
                  }}
                  disabled={isExporting}
                  className="gap-2 cursor-pointer"
                >
                  <span>Retention</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    void handleExport("all")
                  }}
                  disabled={isExporting}
                  className="gap-2 cursor-pointer font-medium"
                >
                  <span>All Sections</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
  )
}