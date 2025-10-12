'use client';

import { Button } from '@/components/Button';
import { FaGoogle } from 'react-icons/fa';

export const GoogleSigninButton = () => {
  const handleGoogleSignIn = async () => {};

  return (
    <Button
      onClick={handleGoogleSignIn}
      className="flex w-full items-center justify-center gap-3 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      size="lg"
    >
      <FaGoogle className="h-5 w-5" />
      Pokračovat přes Google
    </Button>
  );
};
