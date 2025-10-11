"use client";
import { Stack } from "@/app/_components/Stack";
import type { ReactNode } from "react";
import { Header } from "./Header";

export type PageProps = {
  children?: ReactNode;
  title?: string;
};

export const Page = ({ children, title }: PageProps) => {
  return (
    <Stack direction="column" gap="1rem" className="bg-background">
      <Stack className="container mx-auto py-8" direction="column" gap="1rem">
        <Header title={title} />

        <main className="w-full flex-1">{children}</main>
      </Stack>
    </Stack>
  );
};
