'use client';

import { authClient } from '@/lib/auth-client';
import { Button } from '@repo/ui/components/Button';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function PasskeyAuth({ mode = 'signin' }: { mode?: 'signin' | 'add' }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddPasskey = async () => {
    setError('');
    setLoading(true);

    try {
      await authClient.passkey.addPasskey({
        name: name || 'My Passkey',
      });
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add passkey');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await authClient.signIn.passkey();
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'add') {
    return (
      <div className="space-y-4 w-full max-w-md">
        <div className="space-y-2">
          <Label htmlFor="passkey-name">Passkey Name (Optional)</Label>
          <Input
            id="passkey-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Passkey"
            disabled={loading}
          />
          <Button
            onClick={handleAddPasskey}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Adding Passkey...' : 'Add Passkey to Account'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-md">
      <Button onClick={handleSignIn} disabled={loading} className="w-full">
        {loading ? 'Signing in...' : 'Sign In with Passkey'}
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
