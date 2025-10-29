import { authClient } from '@/lib/authClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CopyIcon, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { match, P } from 'ts-pattern';

import { Button } from './Button';

export type ApiKeyProps = {
  id: string;
  secret?: string;
  name: string | null;
  prefix: string | null;
  start: string | null;
  createdAt: Date;
  onDelete?: () => void;
};

export const ApiKey = ({
  id,
  secret,
  name,
  prefix,
  start,
  createdAt,
  onDelete,
}: ApiKeyProps) => {
  const queryClient = useQueryClient();

  const [isVisible, setIsVisible] = useState(false);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);

    toast('API key has been copied to clipboard.');
  };

  const authApiKeyDeleteMutation = useMutation({
    mutationFn: async (opts: { keyId: string }) => {
      await authClient.apiKey.delete({ keyId: opts.keyId });
    },
    onSuccess: () => {
      toast('API key has been deleted.');

      queryClient.invalidateQueries({ queryKey: ['auth', 'apiKey', 'list'] });

      onDelete?.();
    },
  });

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1 space-y-1">
        <p className="font-medium">{name}</p>
        {secret !== undefined && (
          <div className="flex items-center gap-2">
            <code className="text-sm text-muted-foreground font-mono">
              {match({ prefix })
                .with(
                  {
                    prefix: P.not(null),
                  },
                  () => `${prefix}_${secret}`,
                )
                .otherwise(() => secret)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleCopyKey(prefix !== null ? `${prefix}_${secret}` : secret)
              }
            >
              <CopyIcon />
            </Button>
          </div>
        )}
        {prefix !== null && (
          <div className="flex items-center gap-2">
            <code className="text-sm text-muted-foreground font-mono">
              {match({ prefix, start, isVisible })
                .with(
                  {
                    start: P.not(null),
                    isVisible: true,
                  },
                  () => `${prefix}_${start}`,
                )
                .otherwise(() => `${prefix}_`)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible((value) => !value)}
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Created on {createdAt.toISOString()}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => authApiKeyDeleteMutation.mutate({ keyId: id })}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
