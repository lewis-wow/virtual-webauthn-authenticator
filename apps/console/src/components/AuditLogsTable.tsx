'use client';

import { Button } from '@repo/ui/components/Button';
import { DataTable } from '@repo/ui/components/DataTable';
import { Badge } from '@repo/ui/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog';
import { ScrollArea } from '@repo/ui/components/ui/scroll-area';
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import {
  Bot,
  FileJson,
  Key,
  LayoutList,
  ShieldAlert,
  User,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// --- Types ---
// synchronized with your AuditSchema
export interface EventLogEntry {
  id: string; // Assumed present on DB record
  createdAt: string | Date; // Assumed present on DB record

  action: string; // AuditLogActionSchema
  entity: string; // AuditLogEntitySchema
  entityId: string | null; // Schema.NullOr(Schema.UUID)

  userId: string; // Schema.UUID
  apiKeyId: string | null; // Schema.NullOr(Schema.UUID)

  // Metadata is now a Record, not just any
  metadata: Record<string, unknown>;
}

interface EventLogTableProps {
  data: EventLogEntry[];
}

// --- Helper: Action Badge Color ---
const getActionBadge = (action: string) => {
  const upper = action.toUpperCase();
  if (upper.includes('DELETE') || upper.includes('REVOKE')) {
    return <Badge variant="destructive">{action}</Badge>;
  }
  if (upper.includes('CREATE') || upper.includes('UPDATE')) {
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-700">{action}</Badge>
    );
  }
  if (upper.includes('GET') || upper.includes('LIST')) {
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        {action}
      </Badge>
    );
  }
  return <Badge variant="outline">{action}</Badge>;
};

// --- Helper: Entity Icon ---
const getEntityIcon = (entity: string) => {
  const upper = entity.toUpperCase();
  if (upper.includes('KEY')) return <Key className="h-4 w-4" />;
  if (upper.includes('CREDENTIAL')) return <ShieldAlert className="h-4 w-4" />;
  return <LayoutList className="h-4 w-4" />;
};

// --- Sub-Component: JSON Details Viewer ---
const LogDetailsDialog = ({ log }: { log: EventLogEntry }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <FileJson className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">View Details</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
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
                {getEntityIcon(log.entity)}
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

// --- Main Table ---
export function AuditLogsTable({ data }: EventLogTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  const columns: ColumnDef<EventLogEntry>[] = useMemo(
    () => [
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {getActionBadge(row.getValue('action'))}
            <span className="text-xs text-muted-foreground font-mono uppercase truncate max-w-[100px]">
              {row.original.entity}
            </span>
          </div>
        ),
      },
      {
        id: 'actor',
        header: 'Initiated By',
        cell: ({ row }) => {
          const { userId, apiKeyId, metadata } = row.original;

          // Check metadata for "Snapshot" names (Common pattern in audit logs)
          // Adjust keys 'actor_email' or 'key_name' based on your actual metadata structure
          const metaEmail =
            metadata?.email || metadata?.actor_email || metadata?.user_email;
          const metaKeyName =
            metadata?.name || metadata?.key_name || metadata?.api_key_name;

          // 1. API Key Actor
          if (apiKeyId) {
            return (
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 rounded bg-orange-500/10 text-orange-600 shrink-0">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate text-xs">
                    {typeof metaKeyName === 'string' ? metaKeyName : 'API Key'}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                    {apiKeyId}
                  </span>
                </div>
              </div>
            );
          }

          // 2. User Actor
          if (userId) {
            return (
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 rounded bg-blue-500/10 text-blue-600 shrink-0">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate text-xs">
                    {typeof metaEmail === 'string' ? metaEmail : 'User'}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                    {userId}
                  </span>
                </div>
              </div>
            );
          }

          return <span className="text-muted-foreground text-xs">System</span>;
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'));
          return (
            <div className="text-sm whitespace-nowrap">
              <div className="font-medium">{date.toLocaleDateString()}</div>
              <div className="text-xs text-muted-foreground">
                {date.toLocaleTimeString()}
              </div>
            </div>
          );
        },
      },
      {
        id: 'details',
        header: '',
        cell: ({ row }) => <LogDetailsDialog log={row.original} />,
        size: 50, // Small fixed width for action column
      },
    ],
    [],
  );

  const pageData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return data.slice(start, end);
  }, [data, pagination]);

  return (
    <DataTable
      columns={columns}
      data={pageData}
      pagination={pagination}
      paginationOptions={{
        onPaginationChange: setPagination,
        rowCount: data.length,
      }}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}
