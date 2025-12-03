'use client';

// The "New Key" display component
import { ApiKeysTable } from '@/components/ApiKeys/ApiKeysTable';
import { NewApiKey } from '@/components/ApiKeys/NewApiKey';
// Components
import { Page } from '@/components/Page/Page';
import { $api } from '@/lib/tsr';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateApiKeyBodySchema,
  CreateApiKeyFormSchema,
} from '@repo/contract/dto';
import type { Duration } from '@repo/core/zod-validation';
import { useCursorPagination } from '@repo/pagination/hooks';
// The new standalone table
import { Button } from '@repo/ui/components/Button';
import { Guard } from '@repo/ui/components/Guard/Guard';
import { SelectField } from '@repo/ui/components/SelectField';
import { Stack } from '@repo/ui/components/Stack';
import { TextField } from '@repo/ui/components/TextField';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { Form } from '@repo/ui/components/ui/form';
import { keepPreviousData } from '@tanstack/react-query';
import { Key, Plus } from 'lucide-react';
// Added 'Key' import
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const EXPIRATION_OPTIONS = [
  { label: 'Never', value: null },
  { label: '30 Days', value: { days: 30 } },
  { label: '60 Days', value: { days: 60 } },
  { label: '90 Days', value: { days: 90 } },
  { label: '1 Year', value: { years: 1 } },
] as { label: string; value: Duration | null }[];

export const ApiKeysPage = () => {
  const queryClient = $api.useQueryClient();

  // --- 1. Pagination State & Hook ---
  // Break the Cycle: Local state to hold the latest API meta
  const [latestMeta, setLatestMeta] = useState({
    hasNext: false,
    nextCursor: null as string | null,
  });

  const { pagination, onPaginationChange, cursor, rowCount } =
    useCursorPagination({
      defaultPageSize: 5,
      nextCursor: latestMeta.nextCursor,
      hasNextPage: latestMeta.hasNext,
    });

  // --- 2. Queries & Mutations ---

  const authApiKeysListQuery = $api.api.auth.apiKeys.list.useQuery({
    queryKey: [
      'api',
      'auth',
      'apiKeys',
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

  const authApiKeyCreateMutation = $api.api.auth.apiKeys.create.useMutation({
    onSuccess: () => {
      form.reset({
        name: '',
        enabled: true,
        expiresAt: null,
        permissions: [],
      });

      toast('API key has been created.');
      // Invalidate the list to refetch the current page
      void queryClient.invalidateQueries({
        queryKey: ['api', 'auth', 'apiKeys', 'list'],
      });
    },
  });

  // --- 3. Data Sync ---
  const apiKeysData = authApiKeysListQuery.data?.body?.data ?? [];
  const currentMeta = authApiKeysListQuery.data?.body?.meta;

  // Sync Query Result to State for Pagination
  useEffect(() => {
    if (currentMeta) {
      setLatestMeta({
        hasNext: currentMeta.hasNext,
        nextCursor: currentMeta.nextCursor,
      });
    }
  }, [currentMeta]);

  // --- 4. Form Setup ---
  const form = useForm({
    resolver: zodResolver(CreateApiKeyFormSchema),
    defaultValues: {
      name: '',
      enabled: true,
      expiresAt: null,
      permissions: [],
    },
  });

  return (
    <Page pageTitle="API keys">
      {/* --- Create Key Section --- */}
      <Card>
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            Generate a new API key with specific permissions and expiration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                const encodedValues = CreateApiKeyBodySchema.encode(values);
                authApiKeyCreateMutation.mutate({ body: encodedValues });
              })}
            >
              <Stack direction="column" gap="1.5rem" className="w-full">
                <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <TextField
                      name="name"
                      label="Key Name"
                      placeholder="e.g., Production API Key"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="w-full sm:w-[180px]">
                    <SelectField
                      name="expiresAt"
                      label="Expires at"
                      items={EXPIRATION_OPTIONS}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={authApiKeyCreateMutation.isPending}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Key
                  </Button>
                </div>
              </Stack>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* --- Success: New Key Display --- */}
      {authApiKeyCreateMutation.data?.body && (
        <div className="mb-6">
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader>
              <CardTitle className="text-green-700">
                New API Key Created
              </CardTitle>
              <CardDescription>
                Please copy this key now. You will not be able to see it again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NewApiKey
                {...authApiKeyCreateMutation.data.body.apiKey}
                plaintextKey={authApiKeyCreateMutation.data.body.plaintextKey}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- Existing Keys Table --- */}
      <Card>
        <CardHeader>
          {/* UPDATED HEADER STYLE */}
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Your API Keys</CardTitle>
          </div>
          <CardDescription>Manage your existing access keys.</CardDescription>
        </CardHeader>
        <CardContent>
          <Guard
            isLoading={authApiKeysListQuery.isLoading}
            error={authApiKeysListQuery.error}
          >
            <ApiKeysTable
              data={apiKeysData}
              pagination={pagination}
              rowCount={rowCount}
              onPaginationChange={onPaginationChange}
            />
          </Guard>
        </CardContent>
      </Card>
    </Page>
  );
};
