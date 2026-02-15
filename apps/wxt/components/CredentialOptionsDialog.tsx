'use client';

import { Button } from '@repo/ui/components/Button';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from '@repo/ui/components/ui/dialog';
import { ScrollArea } from '@repo/ui/components/ui/scroll-area';
import { cn } from '@repo/ui/lib/utils';
import { Check, KeyRound, User } from 'lucide-react';
import * as React from 'react';

export type CredentialOptionsDialogProps = {
  onCancel: () => void;
  onConfirm: (credentialId: string) => void;
  credentialOptions: {
    id: string;
    name: string | null;
    userDisplayName: string;
  }[];
};

export const CredentialOptionsDialog = ({
  onCancel,
  onConfirm,
  credentialOptions,
}: CredentialOptionsDialogProps) => {
  const [selectedCredential, setSelectedCredential] = React.useState<
    string | null
  >(null);

  const handleConfirm = () => {
    if (selectedCredential) {
      onConfirm(selectedCredential);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <DialogTitle>Select Credential</DialogTitle>
          </div>
          <DialogDescription>
            Choose a credential to use for authentication
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <ScrollArea className="max-h-64">
            <div className="space-y-1.5 pr-4">
              {credentialOptions.map((credential) => {
                const isSelected = selectedCredential === credential.id;

                return (
                  <button
                    key={credential.id}
                    onClick={() => setSelectedCredential(credential.id)}
                    className={cn(
                      'group w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-all cursor-pointer outline-none focus:outline-none focus-visible:outline-none',
                      isSelected ? 'bg-primary/10' : 'hover:bg-accent',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {isSelected ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 gap-0.5">
                      <span
                        className={cn(
                          'text-sm font-medium leading-none truncate',
                          isSelected && 'text-primary',
                        )}
                      >
                        {credential.name ?? credential.userDisplayName}
                      </span>
                      {credential.name && (
                        <span className="text-xs text-muted-foreground truncate">
                          {credential.userDisplayName}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onCancel()}>
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
