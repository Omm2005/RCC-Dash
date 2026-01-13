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
import { NavMain } from "./nav-main"
import { LayoutDashboard, User } from "@hugeicons/core-free-icons"
import Exports from "../exports"

export async function AppSidebar({ isAdmin, ...props }: React.ComponentProps<typeof Sidebar> & { isAdmin: boolean }) {
    const user = await getUser();
  return (
    <Sidebar collapsible="offExamples" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
                {/* <IconInnerShadowTop className="!size-5" /> */}
                <span className="text-base font-semibold">RCC SJSU.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain 
        items={[
          {
            title: 'Dashboard',
            icon: LayoutDashboard,
            url: '/'
          },
          {
            title: 'Admin',
            icon: User,
            url: '/admin'
          }
        ]}
        />
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2" >
        <Exports isAdmin={isAdmin} sidebar classNames="md:hidden" />
        <NavUser user={{
            name: user!.display_name || user!.name || user!.full_name ||"User",
            email: user?.email || "",
            avatar:  user?.avatar_url || user!.picture || "",
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
