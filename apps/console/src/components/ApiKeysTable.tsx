'use client';

import type { ApiKey } from '@repo/auth/validation';
import { Button } from '@repo/ui/components/Button';
import { DataTable } from '@repo/ui/components/DataTable';
import { Badge } from '@repo/ui/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@repo/ui/components/ui/dropdown-menu';
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { MoreHorizontal, Copy, Trash } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

interface ApiKeysTableProps {
  data: ApiKey[];
  onDelete?: (id: string) => void;
}

export function ApiKeysTable({ data, onDelete }: ApiKeysTableProps) {
  // --- Local State for Client-Side Pagination/Sorting ---
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  // --- Columns Definition ---
  const columns: ColumnDef<ApiKey>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'));
          return (
            <div className="text-muted-foreground">
              {date.toLocaleDateString()}
            </div>
          );
        },
      },
      {
        accessorKey: 'expiresAt',
        header: 'Expires',
        cell: ({ row }) => {
          const val = row.getValue('expiresAt') as string | null;
          if (!val) return <Badge variant="secondary">Never</Badge>;
          return (
            <div className="text-muted-foreground">
              {new Date(val).toLocaleDateString()}
            </div>
          );
        },
      },
      {
        accessorKey: 'enabled',
        header: 'Status',
        cell: ({ row }) => {
          const isEnabled = row.getValue('enabled');
          return (
            <Badge variant={isEnabled ? 'default' : 'destructive'}>
              {isEnabled ? 'Active' : 'Revoked'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const apiKey = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey.id);
                    toast('API Key ID copied to clipboard');
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDelete?.(apiKey.id)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Key
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onDelete],
  );

  // --- Slicing Logic (Client-Side Pagination) ---
  // Since the core DataTable is set to manualPagination: true,
  // we must slice the data before passing it down.
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
