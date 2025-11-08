import { tsr } from '@/lib/tsr';
import { cn } from '@/lib/utils';
import { CopyIcon, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from './Button';

export type ApiKeyProps = {
  id: string;
  plaintextKey?: string;
  name: string | null;
  prefix: string | null;
  createdAt: Date;
  revokedAt: Date | null;
  onDelete?: () => void;
  onRevoke?: () => void;
};

export const ApiKey = ({
  id,
  plaintextKey,
  name,
  prefix,
  createdAt,
  revokedAt,
  onDelete,
  onRevoke,
}: ApiKeyProps) => {
  const queryClient = tsr.useQueryClient();

  const [isVisible, setIsVisible] = useState(false);

  const handleCopyKey = () => {
    if (!plaintextKey) {
      return;
    }

    navigator.clipboard.writeText(plaintextKey);

    toast('API key has been copied to clipboard.');
  };

  const authApiKeyRevokeMutation = tsr.api.auth.apiKeys.update.useMutation({
    onSuccess: () => {
      toast('API key has been revoked.');

      queryClient.invalidateQueries({
        queryKey: ['api', 'auth', 'apiKeys', 'list'],
      });

      onRevoke?.();
    },
  });

  const authApiKeyDeleteMutation = tsr.api.auth.apiKeys.delete.useMutation({
    onSuccess: () => {
      toast('API key has been deleted.');

      queryClient.invalidateQueries({
        queryKey: ['api', 'auth', 'apiKeys', 'list'],
      });

      onDelete?.();
    },
  });

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1 space-y-1">
        <p className="font-medium">
          <span
            className={cn({
              'line-through': revokedAt !== null,
            })}
          >
            {name}
          </span>
        </p>
        {plaintextKey !== undefined && (
          <div className="flex items-center gap-2">
            <code className="text-sm text-muted-foreground font-mono">
              {plaintextKey}
            </code>
            <Button variant="ghost" size="sm" onClick={() => handleCopyKey()}>
              <CopyIcon />
            </Button>
          </div>
        )}
        {prefix !== null && (
          <div className="flex items-center gap-2">
            <code className="text-sm text-muted-foreground font-mono">
              {`${prefix}_`}
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
          onClick={() => {
            if (revokedAt === null) {
              authApiKeyRevokeMutation.mutate({
                params: { id },
                body: { revokedAt: new Date().toISOString(), enabled: false },
              });

              return;
            }

            authApiKeyDeleteMutation.mutate({ params: { id } });
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
