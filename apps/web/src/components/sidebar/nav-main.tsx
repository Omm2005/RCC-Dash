"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { QuickImportModal } from "@/components/sidebar/quick-import-modal"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: IconSvgElement
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <QuickImportModal />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url as any}>
              <SidebarMenuButton tooltip={item.title} className="cursor-pointer">
                {item.icon && <HugeiconsIcon icon={item.icon} className="size-5 mr-2" />}
                <span>{item.title}</span>
              </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
