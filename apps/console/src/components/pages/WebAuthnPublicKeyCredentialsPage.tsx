'use client';

import { Page } from '@/components/Page/Page';
import { WebAuthnPublicKeyCredentialsTable } from '@/components/WebAuthnPublicKeyCredentialsTable';
import { $api } from '@/lib/tsr';
import { useCursorPagination } from '@repo/pagination/hooks';
import { Guard } from '@repo/ui/components/Guard/Guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { keepPreviousData } from '@tanstack/react-query';
import { Fingerprint } from 'lucide-react';
import { useEffect, useState } from 'react';

export const WebAuthnPublicKeyCredentialsPage = () => {
  // 1. Break the Cycle: Local state to hold the latest API meta
  const [latestMeta, setLatestMeta] = useState({
    hasNext: false,
    nextCursor: null as string | null,
  });

  // 2. Initialize the Hook
  const { pagination, onPaginationChange, cursor, rowCount } =
    useCursorPagination({
      defaultPageSize: 10,
      nextCursor: latestMeta.nextCursor,
      hasNextPage: latestMeta.hasNext,
    });

  // 3. Run the Query
  const credentialsQuery = $api.api.webAuthnPublicKeyCredentials.list.useQuery({
    queryKey: [
      'api',
      'webAuthnPublicKeyCredentials',
      'list',
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryData: {
      query: {
        limit: pagination.pageSize,
        cursor: cursor,
      },
    },
    placeholderData: keepPreviousData,
  });

  // Handle data extraction (safely defaulting to empty array if data structure varies)
  // Assumes API returns { body: { data: [], meta: {} } } like the logs API
  const credentials = credentialsQuery.data?.body?.data ?? [];
  const currentMeta = credentialsQuery.data?.body?.meta;

  // 4. Sync Query Result to State
  useEffect(() => {
    if (currentMeta) {
      setLatestMeta({
        hasNext: currentMeta.hasNext,
        nextCursor: currentMeta.nextCursor,
      });
    }
  }, [currentMeta]);

  return (
    <Page pageTitle="WebAuthn Credentials">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Passkeys & Hardware Tokens</CardTitle>
          </div>
          <CardDescription>
            Manage your credentials stored in Azure Key Vault.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Guard
            isLoading={credentialsQuery.isLoading}
            error={credentialsQuery.error}
          >
            <WebAuthnPublicKeyCredentialsTable
              data={credentials}
              pagination={pagination}
              onPaginationChange={onPaginationChange}
              rowCount={rowCount}
            />
          </Guard>
        </CardContent>
      </Card>
    </Page>
  );
};
