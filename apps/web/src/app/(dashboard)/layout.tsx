import { SiteHeader } from '@/components/header';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { getUserRole } from "@/lib/actions";
import React from 'react'

type Props = {
    children: React.ReactNode;
}

const layout = async ({children}: Props) => {
  const result = await getUserRole();
  if(!result) {
    return null;
  }

  const { role } = result.data
  const isAdmin = role === "admin";

  return (
    <>
      <AppSidebar variant='inset' isAdmin={isAdmin} role={role as string} />
        <SidebarInset>
          <SiteHeader isAdmin={isAdmin} />
          {children}
        </SidebarInset>
    </>
  )
}

export default layout
