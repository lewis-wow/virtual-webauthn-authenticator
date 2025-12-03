'use client';

import type { Log } from '@repo/activity-log/zod-validation';
import { Button } from '@repo/ui/components/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@repo/ui/components/ui/dialog';
import { ScrollArea } from '@repo/ui/components/ui/scroll-area';
import { FileJson, X } from 'lucide-react';
import { useState } from 'react';

import { LogEntityIcon } from './LogEntityIcon';

export type LogDetailsDialogProps = {
  log: Log;
};

export const LogDetailsDialog = ({ log }: LogDetailsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <FileJson className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">View Details</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg" showCloseButton={false}>
        {/* --- ADDED CLOSE BUTTON HERE --- */}
        <DialogClose asChild>
          <Button
            variant="ghost"
            className="absolute top-4 right-4 h-6 w-6 p-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
        {/* ------------------------------- */}

        <DialogHeader>
          <DialogTitle>Event Details</DialogTitle>
          <DialogDescription>
            Raw metadata payload for event ID:{' '}
            <code className="text-xs select-all">{log.id}</code>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-muted-foreground">
                Action:
              </span>
              <p>{log.action}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">
                Entity:
              </span>
              <p className="flex items-center gap-2">
                <LogEntityIcon entity={log.entity} />
                {log.entity}
              </p>
            </div>
            <div className="col-span-2">
              <span className="font-semibold text-muted-foreground">
                Entity ID:
              </span>
              <p className="font-mono text-xs select-all">
                {log.entityId || 'N/A'}
              </p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">
                Actor ID:
              </span>
              <p className="font-mono text-xs select-all">
                {log.apiKeyId || log.userId}
              </p>
            </div>
          </div>

          <div className="rounded-md border bg-muted/50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Metadata Payload
            </p>
            <ScrollArea className="h-[200px] w-full rounded-md border bg-zinc-950 p-4">
              <pre className="text-xs text-zinc-50 font-mono">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
