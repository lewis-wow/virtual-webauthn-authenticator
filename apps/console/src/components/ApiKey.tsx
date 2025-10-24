import { authClient } from '@/lib/authClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from './Button';

export type ApiKeyProps = {
  id: string;
  name: string;
  createdAt: Date;
  onDelete?: () => void;
};

export const ApiKey = ({ id, name, createdAt, onDelete }: ApiKeyProps) => {
  const queryClient = useQueryClient();

  const [isVisible, setIsVisible] = useState(false);

  const maskKey = (key: string) => {
    return key.substring(0, 7) + '•'.repeat(20);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);

    toast('API key has been copied to clipboard.');
  };

  const authApiKeyDeleteMutation = useMutation({
    mutationFn: async (opts: { keyId: string }) => {
      const { data } = await authClient.apiKey.delete({
        keyId: opts.keyId,
      });

      return data;
    },
    onSuccess: () => {
      toast('API key has been deleted.', {
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo'),
        },
      });

      queryClient.invalidateQueries({ queryKey: ['auth.apiKey.list'] });

      onDelete?.();
    },
  });

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1 space-y-1">
        <p className="font-medium">{name}</p>
        <div className="flex items-center gap-2">
          <code className="text-sm text-muted-foreground font-mono">
            {isVisible ? id : maskKey(id)}
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
        <p className="text-xs text-muted-foreground">
          Created on {createdAt.toISOString()}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleCopyKey(id)}>
          <Copy className="h-4 w-4" />
        </Button>
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
