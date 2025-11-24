'use client';

import { Nav } from '@/components/Nav';
import { NavUser } from '@/components/NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/ui/sidebar';
import {
  LayoutDashboard,
  Settings2,
  Key,
  Fingerprint,
  Blocks,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import * as React from 'react';

export type SidebarItem = {
  title: string;
  url: string;
  icon: ReactNode;
};

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'API keys',
      url: '/dashboard/api-keys',
      icon: Key,
    },
    {
      title: 'Credentials',
      url: '/dashboard/webauthn-credentials',
      icon: Fingerprint,
    },
    {
      title: 'Browser extension',
      url: '/dashboard/browser-extension',
      icon: Blocks,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings2,
    },
  ],
};

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <span className="text-base font-semibold">
                  {process.env.NEXT_PUBLIC_APP_NAME}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <Nav items={data.navMain} />
        <Nav items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};
