import { Button } from '@repo/ui/components/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog';
import { ScrollArea } from '@repo/ui/components/ui/scroll-area';
import type { PublicKeyCredentialCandidate } from '@repo/virtual-authenticator/validation';
import { useState } from 'react';

export type CredentialSelectorProps = {
  credentials: PublicKeyCredentialCandidate[];
  open: boolean;
  onSelect: (credential: PublicKeyCredentialCandidate) => void;
  onCancel: () => void;
};

export const CredentialSelector = ({
  credentials,
  open,
  onSelect,
  onCancel,
}: CredentialSelectorProps) => {
  const [selectedCredential, setSelectedCredential] =
    useState<PublicKeyCredentialCandidate | null>(null);

  const handleConfirm = () => {
    if (selectedCredential) {
      onSelect(selectedCredential);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Credential</DialogTitle>
          <DialogDescription>
            Multiple credentials are available. Please select one to continue.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-2">
            {credentials.map((credential) => (
              <button
                key={credential.id}
                onClick={() => setSelectedCredential(credential)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:bg-accent ${
                  selectedCredential?.id === credential.id
                    ? 'border-primary bg-accent'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
                      <path d="m21 2-9.6 9.6" />
                      <circle cx="7.5" cy="15.5" r="5.5" />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span className="font-medium">
                        {credential.name || credential.userDisplayName}
                      </span>
                    </div>
                    {credential.userEmail && (
                      <p className="text-sm text-muted-foreground">
                        {credential.userEmail}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      User ID: {credential.userId.slice(0, 16)}...
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedCredential}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
