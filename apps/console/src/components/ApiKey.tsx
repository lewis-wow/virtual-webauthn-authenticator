import { tsr } from '@/lib/tsr';
import { Button } from '@repo/ui/components/Button';
import { DeleteConfirmDialog } from '@repo/ui/components/DeleteConfirmDialog';
import { cn } from '@repo/ui/lib/utils';
import { CopyIcon, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export type ApiKeyProps = {
  id: string;
  plaintextKey?: string;
  name: string | null;
  start: string | null;
  prefix: string | null;
  createdAt: Date;
  revokedAt?: Date | null;
  onDelete?: () => void;
  onRevoke?: () => void;
};

export const ApiKey = ({
  id,
  plaintextKey,
  name,
  prefix,
  start,
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
  const isRevoked = revokedAt !== null;

  const handleDeleteOrRevoke = () => {
    if (!isRevoked) {
      authApiKeyRevokeMutation.mutate({
        params: { id },
        body: { revokedAt: new Date().toISOString(), enabled: false },
      });
    } else {
      authApiKeyDeleteMutation.mutate({ params: { id } });
    }
  };

  const dialogTitle = isRevoked ? 'Delete API Key?' : 'Revoke API Key?';
  const dialogDescription = isRevoked
    ? 'This will permanently remove the key history. This action cannot be undone.'
    : 'The key will stop working immediately. You can still see it in the history until you delete it.';
  const dialogButtonText = isRevoked ? 'Delete' : 'Revoke';

  return (
    <div className="flex items-center gap-2 p-4 border rounded-lg">
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
        {plaintextKey !== undefined ? (
          <div className="flex items-center gap-2">
            <code className="text-sm text-muted-foreground font-mono break-all">
              {plaintextKey}
            </code>
            <Button
              className="shrink-0"
              variant="ghost"
              size="sm"
              onClick={() => handleCopyKey()}
            >
              <CopyIcon />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <code className="text-sm text-muted-foreground font-mono overflow-x-scroll">
              {`${prefix ?? ''}${isVisible && start ? `${start}...` : ''}`}
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
        <DeleteConfirmDialog
          title={dialogTitle}
          description={dialogDescription}
          confirmText={dialogButtonText}
          onConfirm={handleDeleteOrRevoke}
          trigger={
            <Button
              variant="destructive"
              size="sm"
              className="mt-1"
              disabled={
                authApiKeyRevokeMutation.isPending ||
                authApiKeyDeleteMutation.isPending
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        />
      </div>
    </div>
  );
};
