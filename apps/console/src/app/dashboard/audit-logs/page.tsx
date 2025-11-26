'use client';

import { AuditLogsTable } from '@/components/Logs/AuditLogsTable';
import { Page } from '@/components/Page/Page';
import { $api } from '@/lib/tsr';
import { useCursorPagination } from '@repo/pagination/hooks';
import { Guard } from '@repo/ui/components/Guard/Guard';
// Ensure this path matches where you saved the hook
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

const EventLogPage = () => {
  // 1. Break the Cycle: Local state to hold the latest API meta
  // We need this because the Hook needs data that comes from the Query,
  // but the Query needs the Cursor from the Hook.
  const [latestMeta, setLatestMeta] = useState({
    hasNext: false,
    nextCursor: null as string | null,
  });

  // 2. Initialize the Hook
  // We feed it the meta we captured from the last successful fetch
  const { pagination, onPaginationChange, cursor, rowCount } =
    useCursorPagination({
      defaultPageSize: 10,
      nextCursor: latestMeta.nextCursor,
      hasNextPage: latestMeta.hasNext,
    });

  // 3. Run the Query
  // Note: We use the 'cursor' and 'pagination' directly from the hook
  const logsQuery = $api.api.auditLogs.list.useQuery({
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

  // 4. Sync Query Result to State
  // When new data arrives, update our local meta so the Hook knows
  // what the *next* cursor is for the *next* page turn.
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
            <AuditLogsTable
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

export default EventLogPage;
