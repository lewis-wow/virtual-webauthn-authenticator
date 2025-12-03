'use client';

import { useSignOut } from '@/hooks/useSignOut';
import { $api } from '@/lib/tsr';
import { getInitials } from '@/lib/utils/getInitials';
import { Guard } from '@repo/ui/components/Guard/Guard';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@repo/ui/components/ui/sidebar';
import { ChevronsUpDown, LogOut } from 'lucide-react';

export const NavUser = () => {
  const { isMobile } = useSidebar();

  const { signOut } = useSignOut();

  const profileGetQuery = $api.api.profile.get.useQuery({
    queryKey: ['api', 'profile', 'get'],
  });

  const jwtPayload = profileGetQuery.data?.body.jwtPayload;

  return (
    <Guard isLoading={profileGetQuery.isLoading}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage
                    src={jwtPayload?.image ?? undefined}
                    alt={jwtPayload?.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(jwtPayload?.name ?? '')}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {jwtPayload?.name}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {jwtPayload?.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={jwtPayload?.image ?? undefined}
                      alt={jwtPayload?.name}
                    />
                    <AvatarFallback className="rounded-lg">
                      {getInitials(jwtPayload?.name ?? '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {jwtPayload?.name}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {jwtPayload?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={async () => await signOut()}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </Guard>
  );
};
