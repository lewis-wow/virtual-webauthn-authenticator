import { SidebarMenuButton as SidebarMenuButtonUI } from '@repo/ui/components/ui/sidebar';
import { cn } from '@repo/ui/lib/utils';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type SidebarMenuButtonProps = {
  title: string;
  url: string;
  match?: string | RegExp;
  icon?: LucideIcon;
  tooltip?: string;
};

export const SidebarMenuButton = ({
  title,
  url,
  match,
  icon: Icon,
  tooltip,
}: SidebarMenuButtonProps) => {
  const pathname = usePathname();
  const matcher = match ?? url;

  const isActive =
    matcher instanceof RegExp ? matcher.test(pathname) : pathname === matcher;

  return (
    <SidebarMenuButtonUI
      tooltip={tooltip}
      isActive={isActive}
      className={cn('cursor-pointer', {
        'bg-primary! text-primary-foreground! hover:bg-primary/90! hover:text-primary-foreground! active:bg-primary/90! active:text-primary-foreground! duration-200! ease-linear!':
          isActive,
      })}
      asChild
    >
      <Link href={url}>
        {Icon && <Icon />}
        <span>{title}</span>
      </Link>
    </SidebarMenuButtonUI>
  );
};
