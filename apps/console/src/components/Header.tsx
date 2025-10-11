"use client";

import { Button } from "@/app/_components/Button";
import { Plus, LogIn } from "lucide-react";
import type { ReactNode } from "react";
import { TypographyH1 } from "./Typography";
import { Separator } from "./ui/separator";
import { Link } from "@/app/i18n/navigation";
import { useSession } from "next-auth/react";
import { match } from "ts-pattern";
import { UserAvatarDropdownMenu } from "./UserAvatarDropdownMenu";

export type HeaderProps = {
  title?: ReactNode;
};

export const Header = ({ title }: HeaderProps) => {
  const { status, data: session } = useSession();

  console.log({ session });

  return (
    <header className="bg-background w-full border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <Link href="/">
              <TypographyH1>
                Spolubydlič
                {title && (
                  <>
                    <Separator orientation="vertical" />
                    {title}
                  </>
                )}
              </TypographyH1>
            </Link>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" href="/apartment/create">
              <Plus className="mr-2 h-4 w-4" />
              Přidat inzerát
            </Button>
            {match({ status, session })
              .with({ status: "authenticated" }, ({ session }) => (
                <UserAvatarDropdownMenu
                  image={session!.user.image!}
                  name={session!.user.name!}
                  email={session!.user.email!}
                />
              ))
              .with({ status: "loading" }, () => (
                <Button size="sm" isLoading={status === "loading"} />
              ))
              .with({ status: "unauthenticated" }, () => (
                <Button size="sm" isLoading={status === "loading"}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Přihlásit se
                </Button>
              ))
              .exhaustive()}
          </div>
        </div>
      </div>
    </header>
  );
};
