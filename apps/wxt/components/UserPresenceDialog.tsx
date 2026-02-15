'use client';

import { Button } from '@repo/ui/components/Button';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from '@repo/ui/components/ui/dialog';
import { Fingerprint } from 'lucide-react';

export type UserPresenceDialogProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export const UserPresenceDialog = ({
  onCancel,
  onConfirm,
}: UserPresenceDialogProps) => {
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            <DialogTitle>User Presence Required</DialogTitle>
          </div>
          <DialogDescription>
            Confirm your presence to proceed with the operation.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            The authenticator requires confirmation that you are physically
            present. Press &quot;Confirm&quot; to continue.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
