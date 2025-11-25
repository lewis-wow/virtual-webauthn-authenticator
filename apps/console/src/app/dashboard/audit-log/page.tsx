'use client';

import { AuditLogsTable } from '@/components/AuditLogsTable';
import { Page } from '@/components/Page';
import { $api } from '@/lib/tsr';
import { Guard } from '@repo/ui/components/Guard/Guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { keepPreviousData } from '@tanstack/react-query';
import type { PaginationState } from '@tanstack/react-table';
import { Activity } from 'lucide-react';
import { useState } from 'react';

const EventLogPage = () => {
  // 1. Manage Pagination State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // 2. Manage Cursor History
  // We store the cursor required to reach each page index.
  // Index 0 is always null/undefined (the start).
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);

  // Derive the cursor for the current page request
  const currentCursor = cursorHistory[pagination.pageIndex] ?? null;

  // 3. React Query via ts-rest
  const logsQuery = $api.api.auditLogs.list.useQuery({
    queryKey: [
      'api',
      'eventLog',
      'list',
      pagination.pageIndex,
      pagination.pageSize,
    ], // Unique key per page
    queryData: {
      query: {
        limit: pagination.pageSize,
        // Only pass cursor if it exists (ts-rest usually handles null/undefined, but safer to check)
        cursor: currentCursor || undefined,
      },
    },
    // Keeps old data visible while fetching new data (prevents table flickering)
    placeholderData: keepPreviousData,
  });

  const logsBody = logsQuery.data?.body;
  const logsData = logsBody?.data ?? [];
  const meta = logsBody?.meta ?? { hasNext: false, nextCursor: null };

  // 4. Handle Pagination Updates from Table
  const handlePaginationChange = (updater: any) => {
    // Resolve the new pagination state
    const nextState =
      typeof updater === 'function' ? updater(pagination) : updater;

    setPagination((prev) => {
      // If moving to the NEXT page, save the `nextCursor` from the API response
      if (nextState.pageIndex > prev.pageIndex) {
        setCursorHistory((history) => {
          const newHistory = [...history];
          // Determine where the user is going and save the cursor needed to get there
          if (meta.nextCursor) {
            newHistory[nextState.pageIndex] = meta.nextCursor;
          }
          return newHistory;
        });
      }
      return nextState;
    });
  };

  // 5. Calculate "Fake" Row Count
  // Since we don't know the total count, we trick the table:
  // If there is a next page, tell the table there is (Current * Size) + 1 items.
  // This enables the "Next" button.
  const rowCount = meta.hasNext
    ? (pagination.pageIndex + 1) * pagination.pageSize + 1
    : (pagination.pageIndex + 1) * pagination.pageSize; // Exact count if at end

  return (
    <Page pageTitle="Audit Log">
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
              onPaginationChange={handlePaginationChange}
              rowCount={rowCount}
            />
          </Guard>
        </CardContent>
      </Card>
    </Page>
  );
};

export default EventLogPage;
