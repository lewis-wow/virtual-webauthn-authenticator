import { authClient } from '@/lib/authClient';
import { $api } from '@/lib/tsr';
import { useRouter } from 'next/navigation';

export const useSignOut = () => {
  const queryClient = $api.useQueryClient();
  const router = useRouter();

  const signOut = async () => {
    await authClient.signOut();
    queryClient.setQueryData(['api', 'profile', 'get'], null);
    router.push('/auth/signin');
  };

  return { signOut };
};
