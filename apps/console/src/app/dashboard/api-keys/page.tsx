'use client';

import { ApiKey } from '@/components/ApiKey';
import { Page } from '@/components/Page';
import { tsr } from '@/lib/tsr';
import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { CreateApiKeyRequestBodySchema } from '@repo/contract/validation';
import type { Duration } from '@repo/core/validation';
import { Button } from '@repo/ui/components/Button';
import { Guard } from '@repo/ui/components/Guard/Guard';
import { SelectField } from '@repo/ui/components/SelectField';
import { Stack } from '@repo/ui/components/Stack';
import { TextField } from '@repo/ui/components/TextField';
import { type TreeNode } from '@repo/ui/components/TreeView';
import { TreeViewField } from '@repo/ui/components/TreeViewField';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { Form } from '@repo/ui/components/ui/form';
import { Schema } from 'effect';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const EXPIRATION_OPTIONS = [
  { label: 'Never', value: null },
  { label: '30 Days', value: { days: 30 } },
  { label: '60 Days', value: { days: 60 } },
  { label: '90 Days', value: { days: 90 } },
  { label: '1 Year', value: { years: 1 } },
] as { label: string; value: Duration | null }[];

const permissionsTree: TreeNode[] = [
  {
    id: 'credentials',
    label: 'Credentials Resource',
    children: [
      {
        id: 'credentials.getOnlyCreatedBySelf',
        label: 'Get Only Created Creadentails By Self',
      },
      { id: 'credentials.createOnce', label: 'Create Credential Once' },
      { id: 'credentials.get', label: 'Get Credentails' },
      { id: 'credentials.create', label: 'Create Credentails' },
      { id: 'credentials.delete', label: 'Delete Credentials' },
    ],
  },
];

const ApiKeysPage = () => {
  const queryClient = tsr.useQueryClient();

  const authApiKeysListQuery = tsr.api.auth.apiKeys.list.useQuery({
    queryKey: ['api', 'auth', 'apiKeys', 'list'],
  });

  const authApiKeyCreateMutation = tsr.api.auth.apiKeys.create.useMutation({
    onSuccess: () => {
      form.reset({
        name: '',
        enabled: true,
        expiresAt: null,
        permissions: {
          credentials: ['getOnlyCreatedBySelf', 'createOnce'],
        },
      });

      toast('API key has been created.');

      queryClient.invalidateQueries({
        queryKey: ['api', 'auth', 'apiKeys', 'list'],
      });
    },
  });

  const form = useForm({
    resolver: effectTsResolver(CreateApiKeyRequestBodySchema),
    defaultValues: {
      name: '',
      enabled: true,
      expiresAt: null,
      permissions: {
        credentials: ['getOnlyCreatedBySelf', 'createOnce'],
      },
    },
  });

  console.log(form.watch());

  return (
    <Page pageTitle="API keys">
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
                const encodedValues = Schema.encodeSync(
                  CreateApiKeyRequestBodySchema,
                )(values);
                authApiKeyCreateMutation.mutate({ body: encodedValues });
              })}
            >
              <Stack direction="column" gap="1.5rem" className="w-full">
                {/* Top Row: Name & Expiration - Added w-full here */}
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

                <TreeViewField
                  nodes={permissionsTree}
                  name="permissions"
                  label="Permissions"
                  required
                  description="Select what credentials this API key can access."
                />

                <div className="flex justify-end">
                  <Button type="submit">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Key
                  </Button>
                </div>
              </Stack>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <Guard
            isLoading={authApiKeysListQuery.isLoading}
            error={authApiKeysListQuery.error}
            isEmpty={authApiKeysListQuery.data?.body.length === 0}
          >
            <Stack direction="column" gap="1rem">
              {authApiKeyCreateMutation.data?.body && (
                <ApiKey
                  {...authApiKeyCreateMutation.data?.body.apiKey}
                  plaintextKey={
                    authApiKeyCreateMutation.data?.body.plaintextKey
                  }
                  key={authApiKeyCreateMutation.data?.body.apiKey.id}
                />
              )}
              {authApiKeysListQuery.data?.body
                .filter(
                  (apiKey) =>
                    apiKey.id !== authApiKeyCreateMutation.data?.body.apiKey.id,
                )
                .map((apiKey) => (
                  <ApiKey {...apiKey} key={apiKey.id} />
                ))}
            </Stack>
          </Guard>
        </CardContent>
      </Card>
    </Page>
  );
};

export default ApiKeysPage;
