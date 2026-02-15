'use client';

import { Button } from '@repo/ui/components/Button';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from '@repo/ui/components/ui/dialog';
import { ShieldCheck } from 'lucide-react';

export type UserVerificationDialogProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export const UserVerificationDialog = ({
  onCancel,
  onConfirm,
}: UserVerificationDialogProps) => {
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <DialogTitle>User Verification Required</DialogTitle>
          </div>
          <DialogDescription>
            Verify your identity to proceed with the operation.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            The authenticator requires user verification. Press
            &quot;Verify&quot; to confirm your identity and continue.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Verify</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
