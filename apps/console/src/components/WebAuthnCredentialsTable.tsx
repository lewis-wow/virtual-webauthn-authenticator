'use client';

import { $api } from '@/lib/tsr';
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
import type { WebAuthnCredential } from '@repo/virtual-authenticator/zod-validation';
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import {
  Copy,
  Fingerprint,
  MoreHorizontal,
  ShieldCheck,
  Trash,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

export interface WebAuthnTableProps {
  data: readonly WebAuthnCredential[];
  pagination: PaginationState;
  rowCount: number;
  onPaginationChange: (updater: any) => void;
}

// --- 1. Row Actions Component ---
const WebAuthnRowActions = ({
  credential,
}: {
  credential: WebAuthnCredential;
}) => {
  const queryClient = $api.useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = $api.api.webAuthnCredentials.delete.useMutation({
    onSuccess: () => {
      toast.success('Credential deleted successfully.');
      void queryClient.invalidateQueries({
        queryKey: ['api', 'webAuthnCredentials', 'list'],
      });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error('Failed to delete credential.');
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({ params: { id: credential.id } });
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
              void navigator.clipboard.writeText(credential.id);
              toast('Credential ID copied to clipboard');
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={(e) => {
              e.preventDefault();
              setShowDeleteDialog(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Credential
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={`Delete "${credential.name || 'Unnamed'}"?`}
        description="This will permanently delete this credential from Azure Key Vault. You will no longer be able to use this authenticator to log in."
        confirmText="Delete Credential"
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
};

export const WebAuthnCredentialsTable = ({
  data,
  pagination,
  rowCount,
  onPaginationChange,
}: WebAuthnTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<WebAuthnCredential>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/10 rounded-md text-blue-600">
              <Fingerprint className="h-4 w-4" />
            </div>
            <span className="font-medium">
              {row.getValue('name') || 'Unnamed Credential'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'rpId',
        header: 'Relying Party',
        cell: ({ row }) => (
          <code className="text-xs bg-muted px-1 py-0.5 rounded text-muted-foreground">
            {row.getValue('rpId')}
          </code>
        ),
      },
      {
        accessorKey: 'webAuthnPublicKeyCredentialKeyVaultKeyMeta.hsm',
        header: 'Security Level',
        cell: ({ row }) => {
          const isHsm =
            row.original.webAuthnPublicKeyCredentialKeyVaultKeyMeta?.hsm;
          return isHsm ? (
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-600 bg-emerald-500/5 gap-1"
            >
              <ShieldCheck className="h-3 w-3" />
              HSM Backed
            </Badge>
          ) : (
            <Badge variant="secondary">Software</Badge>
          );
        },
      },
      {
        accessorKey: 'counter',
        header: 'Usage',
        cell: ({ row }) => (
          <div className="text-muted-foreground text-sm">
            {row.getValue('counter')} logins
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'));
          return (
            <div className="text-muted-foreground text-sm">
              {date.toLocaleDateString()}
            </div>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => <WebAuthnRowActions credential={row.original} />,
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={pagination}
      paginationOptions={{
        onPaginationChange,
        rowCount,
      }}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
};
