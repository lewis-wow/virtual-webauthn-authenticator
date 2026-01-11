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
import { AlertCircle } from 'lucide-react';

export type ErrorDialogProps = {
  error: {
    message?: string;
    code?: string;
    data?: Record<string, unknown>;
  };
  onClose: () => void;
};

export const ErrorDialog = ({ error, onClose }: ErrorDialogProps) => {
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>Error</DialogTitle>
          </div>
          <DialogDescription>{error.message}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg border bg-muted p-4">
            <div className="mb-2 font-medium text-sm">Error Details:</div>

            {/* 2. Added ScrollArea
                - h-[200px] limits the height of the code block.
                - bg-background creates contrast against the bg-muted container.
            */}
            <ScrollArea className="h-[200px] w-full rounded-md border bg-background p-4">
              <pre className="text-xs">
                <code>{JSON.stringify(error, null, 2)}</code>
              </pre>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onClose()}>
            Close
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(error, null, 2));
            }}
          >
            Copy Error
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
