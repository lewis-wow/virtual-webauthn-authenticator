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
            <DialogTitle>Select Credentials</DialogTitle>
          </div>
          <DialogDescription>
            Choose a credential to use for authentication
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ScrollArea className="h-72 pr-4">
            <div className="space-y-2">
              {credentialOptions.map((credential) => (
                <button
                  key={credential.id}
                  onClick={() => setSelectedCredential(credential.id)}
                  className={cn(
                    'w-full flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent',
                    selectedCredential === credential.id &&
                      'border-primary bg-accent',
                  )}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border mt-0.5',
                      selectedCredential === credential.id
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground',
                    )}
                  >
                    {selectedCredential === credential.id && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>

                  {/* Text Container */}
                  <div className="flex flex-col w-full min-w-0 gap-1">
                    {/* Credential Name */}
                    {credential.name && (
                      <span className="font-medium text-sm leading-none">
                        {credential.name}
                      </span>
                    )}

                    {/* User Display Name */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate font-medium">
                        {credential.userDisplayName}
                      </span>
                    </div>

                    {/* Credential ID */}
                    <span className="text-[10px] text-muted-foreground/60 break-all font-mono mt-1">
                      ID: {credential.id}
                    </span>
                  </div>
                </button>
              ))}
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
