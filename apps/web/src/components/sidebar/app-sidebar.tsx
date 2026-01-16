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
import Exports from "../Exports"
import Users from "../Icons/Users"
import User from "../Icons/User"
import Dashboard from "../Icons/Dashboard"

export async function AppSidebar({
  isAdmin,
  role,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  isAdmin: boolean
  role?: string | null
}) {
  //! Type issue! TODO: fix later
  const user: any = await getUser()
  const displayName = user?.display_name || user?.full_name || user?.name || "User"
  const email = user?.email || ""
  const avatar = user?.avatar_url || user?.picture || ""
  const joinedAt = user?.created_at || null
  const userId = user?.id

  const items = isAdmin ?
  [
    {
      title: 'Dashboard',
      icon: <Dashboard />,
      url: '/'
    },
    {
      title: 'Admin',
      icon: <User />,
      url: '/admin'
    },
    {
      title: 'Users',
      icon: <Users />,
      url: '/users'
    }
  ] : [
    {
      title: 'Dashboard',
      icon: <Dashboard />,
      url: '/'
    }
  ]

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
        items={items}
        />
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2" >
        <Exports isAdmin={isAdmin} sidebar classNames="md:hidden" />
        <NavUser user={{
            id: userId,
            name: displayName,
            email,
            avatar,
            joinedAt,
        }} role={role} />
      </SidebarFooter>
    </Sidebar>
  )
}
