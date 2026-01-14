"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AddCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Button } from "../ui/button"
import Link from "next/link"

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
<Button variant="default" size='sm' className="text-sm font-medium min-w-full duration-200 ease-linear flex justify-start items-center gap-2" >
          <HugeiconsIcon icon={AddCircleIcon} />
            <span>Quick Upload</span>
          </Button>
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
