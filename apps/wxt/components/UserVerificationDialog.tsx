'use client';

import { Button } from '@repo/ui/components/Button';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from '@repo/ui/components/ui/dialog';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { VirtualAuthenticatorUserVerificationType } from '@repo/virtual-authenticator/enums';
import { KeyRound, ShieldCheck } from 'lucide-react';
import * as React from 'react';

export type UserVerificationDialogProps = {
  userVerificationType: string;
  onCancel: () => void;
  onConfirm: (opts: { pin?: string }) => void;
};

export const UserVerificationDialog = ({
  userVerificationType,
  onCancel,
  onConfirm,
}: UserVerificationDialogProps) => {
  const [pin, setPin] = React.useState('');

  const requiresPin =
    userVerificationType === VirtualAuthenticatorUserVerificationType.PIN;

  const handleConfirm = () => {
    if (requiresPin) {
      onConfirm({ pin });
    } else {
      onConfirm({});
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {requiresPin ? (
              <KeyRound className="h-5 w-5 text-primary" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-primary" />
            )}
            <DialogTitle>User Verification Required</DialogTitle>
          </div>
          <DialogDescription>
            Verify your identity to proceed with the operation.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {requiresPin ? (
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && pin.length > 0) {
                    handleConfirm();
                  }
                }}
                autoFocus
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              The authenticator requires user verification. Press
              &quot;Verify&quot; to confirm your identity and continue.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={requiresPin && !pin}>
            Verify
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
