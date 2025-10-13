'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from '@/lib/auth';
import { LogOut } from 'lucide-react';

export type UserAvatarDropdownMenuProps = {
  image: string;
  name: string;
  email: string;
};

export const UserAvatarDropdownMenu = ({
  image,
  name,
  email,
}: UserAvatarDropdownMenuProps) => {
  const { data: session } = useSession();

  console.log(session);

  const handleSignout = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer transition-opacity hover:opacity-80">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{name}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {email && (
          <div className="text-muted-foreground px-2 py-1.5 text-sm">
            {email}
          </div>
        )}

        <DropdownMenuItem
          onClick={handleSignout}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
