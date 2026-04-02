'use client';

import { LogsTable } from '@/components/Logs/LogsTable';
import { Page } from '@/components/Page/Page';
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
import { Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

export const LogsPage = () => {
  const [latestMeta, setLatestMeta] = useState({
    hasNext: false,
    nextCursor: null as string | null,
  });

  const { pagination, onPaginationChange, cursor, rowCount } =
    useCursorPagination({
      defaultPageSize: 10,
      nextCursor: latestMeta.nextCursor,
      hasNextPage: latestMeta.hasNext,
    });

  const logsQuery = $api.api.logs.list.useQuery({
    queryKey: [
      'api',
      'eventLog',
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

  const logsData = logsQuery.data?.body?.data ?? [];
  const currentMeta = logsQuery.data?.body?.meta;

  useEffect(() => {
    if (currentMeta) {
      setLatestMeta({
        hasNext: currentMeta.hasNext,
        nextCursor: currentMeta.nextCursor,
      });
    }
  }, [currentMeta]);

  return (
    <Page pageTitle="Audit Logs">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <CardTitle>System Activity</CardTitle>
          </div>
          <CardDescription>
            A chronological record of security events and data changes within
            your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Guard isLoading={logsQuery.isLoading} error={logsQuery.error}>
            <LogsTable
              data={logsData}
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
