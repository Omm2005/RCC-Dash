'use client'

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AddCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function SiteHeader() {
  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--header-height)]">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-3 self-center data-[orientation=vertical]:h-6 my-auto data-[orientation=vertical]:w-px"
        />
        <h1 className="text-base font-semibold tracking-tight">RCC Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size='sm' className="text-sm font-medium min-w-8 duration-200 ease-linear" >
          <HugeiconsIcon icon={AddCircleIcon} />
            <span>Quick Upload</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
