import { SiteHeader } from '@/components/header';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { getUserRole } from "@/lib/actions";
import React from 'react'

type Props = {
    children: React.ReactNode;
}

const layout = async ({children}: Props) => {
  const role = await getUserRole();
  const isAdmin = role === "admin";

  return (
    <>
      <AppSidebar variant='inset' isAdmin={isAdmin} role={role} />
        <SidebarInset>
          <SiteHeader isAdmin={isAdmin} />
          {children}
        </SidebarInset>
    </>
  )
}

export default layout
