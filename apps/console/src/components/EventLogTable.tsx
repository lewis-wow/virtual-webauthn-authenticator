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
// Ideally imported from your generated types.
// We include relations (apiKey, user) as they are needed for the "Actor" column.
interface EventLogEntry {
  id: string;
  action: string; // e.g., "CREATE", "DELETE", "LOGIN"
  entity: string; // e.g., "API_KEY", "WEBAUTHN_CREDENTIAL"
  entityId: string | null;
  userId: string | null;
  apiKeyId: string | null;
  metadata: any; // JSON
  createdAt: string | Date;

  // Relations (Assumed included in the fetch)
  user?: { email: string; name?: string | null };
  apiKey?: { name: string | null; prefix?: string | null };
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
            <code className="text-xs">{log.id}</code>
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
              <p>{log.entity}</p>
            </div>
            <div className="col-span-2">
              <span className="font-semibold text-muted-foreground">
                Entity ID:
              </span>
              <p className="font-mono text-xs">{log.entityId || 'N/A'}</p>
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
export function EventLogTable({ data }: EventLogTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true }, // Default to newest first
  ]);

  const columns: ColumnDef<EventLogEntry>[] = useMemo(
    () => [
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {getActionBadge(row.getValue('action'))}
            <span className="text-xs text-muted-foreground font-mono uppercase">
              {row.original.entity}
            </span>
          </div>
        ),
      },
      {
        id: 'actor',
        header: 'Initiated By',
        cell: ({ row }) => {
          const { userId, apiKeyId, user, apiKey } = row.original;

          // Logic: If apiKeyId exists, it was an API call. Otherwise, it was a UI call.
          if (apiKeyId) {
            return (
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1 rounded bg-orange-500/10 text-orange-600">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">API Key</span>
                  <span className="text-xs text-muted-foreground">
                    {apiKey?.name || apiKeyId.slice(0, 8) + '...'}
                  </span>
                </div>
              </div>
            );
          }

          if (userId) {
            return (
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1 rounded bg-blue-500/10 text-blue-600">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.name || 'User'}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email || 'Console'}
                  </span>
                </div>
              </div>
            );
          }

          return <span className="text-muted-foreground text-sm">System</span>;
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'));
          return (
            <div className="text-sm">
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
