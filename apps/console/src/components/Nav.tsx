'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from '@repo/ui/components/ui/sidebar';

import {
  SidebarMenuButton,
  type SidebarMenuButtonProps,
} from './SidebarMenuButton';

export type NavProps = {
  items: SidebarMenuButtonProps[];
  className?: string;
};

export const Nav = ({ items, className }: NavProps) => {
  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton {...item} tooltip={item.title} />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
