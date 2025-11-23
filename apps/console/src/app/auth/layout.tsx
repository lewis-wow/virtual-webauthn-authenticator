import { getQueryClient } from '@/lib/getQueryClient';
import { tsr } from '@/lib/tsr';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();
  const tsrQueryClient = tsr.initQueryClient(queryClient);
  const profileGetQuery = await tsrQueryClient.api.profile.get.fetchQuery({
    queryKey: [...'api.profile.get'.split('.')],
    queryData: {
      extraHeaders: Object.fromEntries(await headers()),
    },
  });

  if (profileGetQuery.body.jwtPayload?.userId !== undefined) {
    redirect('/dashboard');
  }

  return children;
}
