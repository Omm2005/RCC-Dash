"use client"

import { useState } from "react"
import { toPng } from "html-to-image"
import jsPDF from "jspdf"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"

type ExportDashboardButtonProps = {
  targetId: string
  isAdmin?: boolean
}

const PNG_PADDING = 32

const formatFileDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

const dataUrlToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(",")
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png"
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

const waitForFonts = async () => {
  if (!document.fonts?.ready) return
  try {
    await document.fonts.ready
  } catch {
    // Best effort; continue export even if fonts fail to resolve.
  }
}

const resolveBackgroundColor = (
  element: HTMLElement,
  resolvedTheme?: string
) => {
  const computed = window.getComputedStyle(element).backgroundColor
  const fallback = resolvedTheme === "dark" ? "#121212" : "#ffffff"

  if (computed === "transparent" || computed === "rgba(0, 0, 0, 0)") {
    return fallback
  }

  return computed
}

const convertColorToRgb = (color: string): [number, number, number] => {
  const temp = document.createElement("div")
  temp.style.color = color
  temp.style.display = "none"
  document.body.appendChild(temp)
  
  const computed = window.getComputedStyle(temp).color
  document.body.removeChild(temp)
  
  const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
  }
  
  return [255, 255, 255]
}

export default function ExportDashboardButton({
  targetId,
  isAdmin = false,
}: ExportDashboardButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { theme, systemTheme } = useTheme()
  const resolvedTheme = theme === "system" ? systemTheme : theme
  const pathname = usePathname()

  const handleExport = async (format: "pdf" | "png") => {
    const target = document.getElementById(targetId)
      if(pathname?.includes("/admin")) {
    toast.error("Exporting is not available in the admin panel.", {
      description: "Please navigate to the main dashboard to export data.",
    })
    return null
  }

    if (!target) {
      toast.error("Unable to find dashboard content.")
      return
    }

    try {
      setIsExporting(true)
      await waitForFonts()

      const exportWidth = Math.max(target.scrollWidth, target.clientWidth)
      const exportHeight = Math.max(target.scrollHeight, target.clientHeight)
      const pixelRatio = Math.min(
        3,
        Math.max(2, window.devicePixelRatio || 2)
      )
      const backgroundColor = resolveBackgroundColor(target, resolvedTheme)

      const renderPngDataUrl = async (withPadding: boolean) => {
        const padding = withPadding ? PNG_PADDING : 0
        const outputWidth = exportWidth + padding * 2
        const outputHeight = exportHeight + padding * 2
        const style: Record<string, string> = {
          transform: "scale(1)",
          transformOrigin: "top left",
          width: `${outputWidth}px`,
          height: `${outputHeight}px`,
        }

        if (padding > 0) {
          style.padding = `${padding}px`
          style.boxSizing = "border-box"
        }

        return toPng(target, {
          quality: 1.0,
          pixelRatio,
          backgroundColor,
          cacheBust: true,
          width: outputWidth,
          height: outputHeight,
          style,
        })
      }

      const filenameBase = `rcc-dashboard-${formatFileDate()}`

      if (format === "png") {
        const dataUrl = await renderPngDataUrl(true)
        const blob = dataUrlToBlob(dataUrl)
        downloadBlob(blob, `${filenameBase}.png`)
        toast.success("PNG export completed.")
        return
      }

      // PDF export
      try {
        // Use html-to-image with options to handle modern CSS and full layout.
        const dataUrl = await renderPngDataUrl(false)
        const img = new Image()
        img.src = dataUrl

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })

        const aspectRatio = img.width / img.height
        const isLandscape = aspectRatio > 1

        const pdf = new jsPDF({
          orientation: isLandscape ? "landscape" : "portrait",
          unit: "pt",
          format: "a4",
          compress: true,
        })

        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()

        const margin = 24
        const availableWidth = pageWidth - margin * 2
        const availableHeight = pageHeight - margin * 2

        const imgWidth = availableWidth
        const imgHeight = imgWidth / aspectRatio
        const xOffset = margin
        const yOffsetSingle = margin + Math.max(0, (availableHeight - imgHeight) / 2)

        // Convert background color to RGB for jsPDF
        const bgRgb = convertColorToRgb(backgroundColor)
        const fillBackground = () => {
          pdf.setFillColor(bgRgb[0], bgRgb[1], bgRgb[2])
          pdf.rect(0, 0, pageWidth, pageHeight, "F")
        }

        fillBackground()

        if (imgHeight <= availableHeight) {
          // Single page
          pdf.addImage(
            dataUrl,
            "PNG",
            xOffset,
            yOffsetSingle,
            imgWidth,
            imgHeight,
            undefined,
            "FAST"
          )
        } else {
          // Multiple pages
          let heightLeft = imgHeight
          let position = margin

          pdf.addImage(
            dataUrl,
            "PNG",
            xOffset,
            position,
            imgWidth,
            imgHeight,
            undefined,
            "FAST"
          )
          heightLeft -= availableHeight

          while (heightLeft > 0) {
            position -= availableHeight
            pdf.addPage()
            fillBackground()

            pdf.addImage(
              dataUrl,
              "PNG",
              xOffset,
              position,
              imgWidth,
              imgHeight,
              undefined,
              "FAST"
            )
            heightLeft -= availableHeight
          }
        }

        pdf.setProperties({
          title: `RCC Dashboard - ${formatFileDate()}`,
          subject: "Dashboard Export",
          creator: "RCC Dashboard",
          author: "RCC",
        })

        pdf.save(`${filenameBase}.pdf`)
        toast.success("PDF export completed.")
      } catch (error) {
        console.error("PDF generation failed, falling back to PNG", error)
        const dataUrl = await renderPngDataUrl(true)
        const blob = dataUrlToBlob(dataUrl)
        downloadBlob(blob, `${filenameBase}.png`)
        toast.success("PNG export completed (PDF failed).")
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Export failed."
      toast.error(message)
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  if (!isAdmin) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="w-full sm:w-auto"
        >
          {isExporting ? "Exporting..." : "Export Dashboard"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            void handleExport("pdf")
          }}
          disabled={isExporting}
        >
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            void handleExport("png")
          }}
          disabled={isExporting}
        >
          PNG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
