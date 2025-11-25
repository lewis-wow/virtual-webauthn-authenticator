'use client';

import { $api } from '@/lib/tsr';
import type { ApiKey } from '@repo/auth/validation';
import { Button } from '@repo/ui/components/Button';
import { DataTable } from '@repo/ui/components/DataTable';
import { DeleteConfirmDialog } from '@repo/ui/components/DeleteConfirmDialog';
import { Badge } from '@repo/ui/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/ui/dropdown-menu';
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { Ban, Copy, MoreHorizontal, Trash } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

export interface ApiKeysTableProps {
  data: readonly ApiKey[];
  pagination: PaginationState;
  rowCount: number;
  onPaginationChange: (updater: any) => void;
}

// --- 1. Dedicated Row Actions Component ---
const ApiKeyRowActions = ({ apiKey }: { apiKey: ApiKey }) => {
  const queryClient = $api.useQueryClient();

  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // --- Mutations ---
  const authApiKeyRevokeMutation = $api.api.auth.apiKeys.update.useMutation({
    onSuccess: () => {
      toast.success('API key has been revoked.');
      queryClient.invalidateQueries({
        queryKey: ['api', 'auth', 'apiKeys', 'list'],
      });
      setShowRevokeDialog(false);
    },
    onError: () => toast.error('Failed to revoke key.'),
  });

  const authApiKeyDeleteMutation = $api.api.auth.apiKeys.delete.useMutation({
    onSuccess: () => {
      toast.success('API key has been deleted.');
      queryClient.invalidateQueries({
        queryKey: ['api', 'auth', 'apiKeys', 'list'],
      });
      setShowDeleteDialog(false);
    },
    onError: () => toast.error('Failed to delete key.'),
  });

  // --- Logic ---
  const isRevoked = apiKey.revokedAt !== null;

  const handleRevoke = () => {
    authApiKeyRevokeMutation.mutate({
      params: { id: apiKey.id },
      body: { revokedAt: new Date().toISOString(), enabled: false },
    });
  };

  const handleDelete = () => {
    authApiKeyDeleteMutation.mutate({ params: { id: apiKey.id } });
  };

  return (
    <>
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

          <DropdownMenuSeparator />

          {!isRevoked ? (
            <DropdownMenuItem
              className="text-amber-600 focus:text-amber-600"
              onSelect={(e) => {
                e.preventDefault();
                setShowRevokeDialog(true);
              }}
            >
              <Ban className="mr-2 h-4 w-4" />
              Revoke Key
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onSelect={(e) => {
                e.preventDefault();
                setShowDeleteDialog(true);
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Key
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmDialog
        open={showRevokeDialog}
        onOpenChange={setShowRevokeDialog}
        title="Revoke API Key?"
        description="The key will stop working immediately. You can still see it in the history until you delete it."
        confirmText="Revoke"
        onConfirm={handleRevoke}
        isPending={authApiKeyRevokeMutation.isPending}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete API Key?"
        description="This will permanently remove the key history. This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        isPending={authApiKeyDeleteMutation.isPending}
      />
    </>
  );
};

// --- 2. Main Table Component ---

export function ApiKeysTable({
  data,
  pagination,
  rowCount,
  onPaginationChange,
}: ApiKeysTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<ApiKey>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const isRevoked = row.original.revokedAt !== null;
          return (
            <div
              className={`font-medium ${isRevoked ? 'line-through text-muted-foreground' : ''}`}
            >
              {row.getValue('name')}
            </div>
          );
        },
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
          const isRevoked = row.original.revokedAt !== null;
          const isEnabled = row.getValue('enabled');

          if (isRevoked) {
            return <Badge variant="destructive">Revoked</Badge>;
          }

          return (
            <Badge variant={isEnabled ? 'default' : 'outline'}>
              {isEnabled ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => <ApiKeyRowActions apiKey={row.original} />,
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
