import { getQueryClient } from '@/lib/getQueryClient';
import { $api } from '@/lib/tsr';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();
  const tsrQueryClient = $api.initQueryClient(queryClient);
  const profileGetQuery = await tsrQueryClient.api.profile.get.fetchQuery({
    queryKey: [...'api.profile.get'.split('.')],
    queryData: {
      extraHeaders: Object.fromEntries(await headers()),
    },
  });

  if (profileGetQuery.body.jwtPayload?.userId === undefined) {
    redirect('/auth/signin');
  }

  return (
    <HydrationBoundary state={dehydrate(tsrQueryClient)}>
      {children}
    </HydrationBoundary>
  );
}
