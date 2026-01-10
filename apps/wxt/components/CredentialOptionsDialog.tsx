'use client';

import { Button } from '@repo/ui/components/Button';
import { DialogContent } from '@repo/ui/components/DialogContent';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog';
import { cn } from '@repo/ui/lib/utils';
import { Check } from 'lucide-react';
import * as React from 'react';

export type CredentialOptionsDialogProps = {
  onOpenChange: (open: boolean) => void;
  onConfirm: (credentialId: string) => void;

  // Data props
  credentialOptions: { id: string; name: string | null }[];
};

export const CredentialOptionsDialog = ({
  onOpenChange,
  onConfirm,
  credentialOptions,
}: CredentialOptionsDialogProps) => {
  const [selectedCredential, setSelectedCredential] = React.useState<
    string | null
  >(null);

  const handleConfirm = () => {
    if (selectedCredential) {
      onConfirm(selectedCredential);
      onOpenChange(false); // Close dialog
    }
  };

  return (
    // We use the 'open' prop from the parent
    <Dialog open={true} onOpenChange={onOpenChange}>
      {/* NO DialogTrigger here anymore */}

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Credentials</DialogTitle>
          <DialogDescription>
            Choose a credential to use for authentication
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            {credentialOptions.map((credential) => (
              <button
                key={credential.id}
                onClick={() => setSelectedCredential(credential.id)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent',
                  selectedCredential === credential.id &&
                    'border-primary bg-accent',
                )}
              >
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border',
                    selectedCredential === credential.id
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground',
                  )}
                >
                  {selectedCredential === credential.id && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                {/* Display name or fallback */}
                <span>{credential.name || credential.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedCredential}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
