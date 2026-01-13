import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Exports from "./exports"


export function SiteHeader({ isAdmin = false }: { isAdmin?: boolean }) {

  return (
    <header className="sticky top-0 z-50 flex h-auto min-h-[var(--header-height)] shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--header-height)] sm:h-[var(--header-height)] rounded-t-md">
      <div className="flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2 lg:gap-3 lg:px-6">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <SidebarTrigger className="-ml-1 hover:bg-accent hover:text-accent-foreground transition-colors" />
          <Separator
            orientation="vertical"
            className="mx-2 self-center data-[orientation=vertical]:h-6 my-auto data-[orientation=vertical]:w-px bg-border"
          />
            <h1 className="truncate text-base font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent sm:text-lg">
              RCC Dashboard
            </h1>
        </div>
        
        {isAdmin && (
          <Exports
          isAdmin={isAdmin}
          classNames="hidden md:flex"
          />
        )}
      </div>
    </header>
  )
}
