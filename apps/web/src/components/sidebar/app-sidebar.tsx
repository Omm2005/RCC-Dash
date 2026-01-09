'use server'

import * as React from "react"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getUser } from "@/lib/actions"

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const user = await getUser();
  return (
    <Sidebar collapsible="offExamples" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                {/* <IconInnerShadowTop className="!size-5" /> */}
                <span className="text-base font-semibold">RCC SJSU.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
            name: user!.display_name || user!.name || user!.full_name ||"User",
            email: user?.email || "",
            avatar:  user?.avatar_url || user!.picture || "",
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
