'use client';

import { EventLogTable } from '@/components/EventLogTable';
import { Page } from '@/components/Page';
import { $authServer } from '@/lib/tsr';
import { Guard } from '@repo/ui/components/Guard/Guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { Activity } from 'lucide-react';

const EventLogPage = () => {
  // Assuming a standard list endpoint exists
  const logsQuery = $authServer.api.eventLog.list.useQuery({
    queryKey: ['api', 'eventLog', 'list'],
  });

  const logs = logsQuery.data?.body || [];

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
            <EventLogTable data={logs} />
          </Guard>
        </CardContent>
      </Card>
    </Page>
  );
};

export default EventLogPage;
