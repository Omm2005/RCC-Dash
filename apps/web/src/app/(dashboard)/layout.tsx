import { SiteHeader } from '@/components/header';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react'

type Props = {
    children: React.ReactNode;
}

const layout = ({children}: Props) => {
  return (
    <>
      <AppSidebar variant='inset' />
        <SidebarInset>
          <SiteHeader />
          {children}
        </SidebarInset>
    </>
  )
}

export default layout