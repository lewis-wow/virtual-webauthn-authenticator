'use client';

import type { Audit } from '@repo/audit-log/zod-validation';
import { DataTable } from '@repo/ui/components/DataTable';
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { Bot, User } from 'lucide-react';
import { useMemo, useState } from 'react';

import { LogActionBadge } from './LogActionBadge';
import { LogDetailsDialog } from './LogDetailsDialog';

export type LogsTableProps = {
  data: readonly Audit[];
  pagination: PaginationState;
  rowCount: number;
  onPaginationChange: (updater: any) => void;
};

export function LogsTable({
  data,
  pagination,
  onPaginationChange,
  rowCount,
}: LogsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  const columns: ColumnDef<Audit>[] = useMemo(
    () => [
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <LogActionBadge action={row.getValue('action')} />
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
          const metaEmail =
            metadata?.email || metadata?.actor_email || metadata?.user_email;
          const metaKeyName =
            metadata?.name || metadata?.key_name || metadata?.api_key_name;

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
        size: 50,
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={pagination}
      sorting={sorting}
      onSortingChange={setSorting}
      paginationOptions={{
        onPaginationChange: onPaginationChange,
        rowCount: rowCount,
      }}
    />
  );
}
