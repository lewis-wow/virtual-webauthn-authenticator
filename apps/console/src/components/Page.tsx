import { SidebarProvider, SidebarInset } from '@repo/ui/components/ui/sidebar';
import type { CSSProperties, ReactNode } from 'react';

import { AppSidebar } from './AppSidebar';
import { Header } from './Header';

export type PageProps = {
  pageTitle: string;
  children?: ReactNode;
};

export const Page = ({ pageTitle, children }: PageProps) => {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Header pageTitle={pageTitle} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
