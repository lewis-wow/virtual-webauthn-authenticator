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

interface ApiKeysTableProps {
  data: ApiKey[];
  onDelete?: (id: string) => void; // Optional: if you want parent to know
}

// --- 1. Dedicated Row Actions Component ---
// We extract this to use Hooks (mutations/state) safely per row
const ApiKeyRowActions = ({ apiKey }: { apiKey: ApiKey }) => {
  const queryClient = $api.useQueryClient();

  // State to control dialogs creates a smoother UX than nesting Triggers in MenuItems
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
  // Determine if we show Revoke or Delete based on revokedAt
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

          {/* Conditional Action: Revoke if active, Delete if already revoked */}
          {!isRevoked ? (
            <DropdownMenuItem
              className="text-amber-600 focus:text-amber-600"
              onSelect={(e) => {
                e.preventDefault(); // Prevent menu from closing immediately
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

      {/* --- Hidden Dialogs triggered by state --- */}

      {/* Revoke Dialog */}
      <DeleteConfirmDialog
        open={showRevokeDialog}
        onOpenChange={setShowRevokeDialog}
        title="Revoke API Key?"
        description="The key will stop working immediately. You can still see it in the history until you delete it."
        confirmText="Revoke"
        onConfirm={handleRevoke}
        isPending={authApiKeyRevokeMutation.isPending}
        // We pass a fragment as trigger because we control open state programmatically via the dropdown
      />

      {/* Delete Dialog */}
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

export function ApiKeysTable({ data }: ApiKeysTableProps) {
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
          // Priority: Check revokedAt first, then enabled status
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
        // We use the custom component here to handle the logic
        cell: ({ row }) => <ApiKeyRowActions apiKey={row.original} />,
      },
    ],
    [],
  );

  // --- Slicing Logic (Client-Side Pagination) ---
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
