import { Button } from '@repo/ui/components/Button';
import { Separator } from '@repo/ui/components/ui/separator';
import { SidebarTrigger } from '@repo/ui/components/ui/sidebar';
import Link from 'next/link';

export type HeaderProps = {
  pageTitle: string;
};

export const Header = ({ pageTitle }: HeaderProps) => {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <Link
              href="https://github.com/lewis-wow/virtual-webauthn-authenticator"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
