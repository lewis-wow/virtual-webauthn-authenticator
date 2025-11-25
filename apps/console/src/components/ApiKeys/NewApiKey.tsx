import { Button } from '@repo/ui/components/Button';
import { ClipboardCopyButton } from '@repo/ui/components/ClipboardCopyButton';
import { cn } from '@repo/ui/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
// Removed CopyIcon
import { useState } from 'react';

// Import the new component

export type NewApiKeyProps = {
  plaintextKey?: string;
  name: string | null;
  start: string | null;
  prefix: string | null;
  createdAt: Date;
  revokedAt?: Date | null;
};

export const NewApiKey = ({
  plaintextKey,
  name,
  prefix,
  start,
  createdAt,
  revokedAt,
}: NewApiKeyProps) => {
  const [isVisible, setIsVisible] = useState(false);

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

        {/* Logic adjusted here */}
        {plaintextKey !== undefined ? (
          <div className="flex items-center gap-2">
            <code className="text-sm text-muted-foreground font-mono break-all">
              {plaintextKey}
            </code>
            <ClipboardCopyButton text={plaintextKey} />
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
    </div>
  );
};
