"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { Building, LogOut } from "lucide-react";
import { getInitials } from "../lib/getInitials";
import { signOut } from "next-auth/react";
import { Link } from "@/app/i18n/navigation";

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
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer transition-opacity hover:opacity-80">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {email && (
          <div className="text-muted-foreground px-2 py-1.5 text-sm">
            {email}
          </div>
        )}
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <Building className="mr-2 h-4 w-4" />
            Moje nabídky
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Odhlásit se
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
