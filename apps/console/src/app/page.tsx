import { getQueryClient } from '@/lib/getQueryClient';
import { $api } from '@/lib/tsr';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const IndexPage = async () => {
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

  redirect('/dashboard');
};

export default IndexPage;
