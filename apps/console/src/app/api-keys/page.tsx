'use client';

import { ApiKey } from '@/components/ApiKey';
import { Button } from '@/components/Button';
import { Guard } from '@/components/Guard/Guard';
import { Page } from '@/components/Page';
import { Stack } from '@/components/Stack';
import { TextField } from '@/components/TextField';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { authClient } from '@/lib/authClient';
import { apiClient, tsr } from '@/lib/tsr';
// import { fetchClient } from '@/lib/api/client';
// import { authClient } from '@/lib/authClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthType } from '@repo/enums';
import {
  CreateApiKeyRequestBodySchema,
  // CreateApiKeyResponseSchema,
  // ListApiKeysResponseSchema,
} from '@repo/validation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const ApiKeys = () => {
  const queryClient = useQueryClient();

  const authApiKeyListQuery = useQuery({
    queryKey: ['auth', 'apiKey', 'list'],
    queryFn: async () => {
      const { data } = await authClient.apiKey.list();

      return data;
    },
  });

  const authApiKeyCreateMutation = useMutation({
    mutationFn: async (opts: { name: string }) => {
      const { data } = await authClient.apiKey.create({
        name: opts.name,
      });

      return data;
    },
    onSuccess: () => {
      form.reset();

      toast('API key has been created.', {
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo'),
        },
      });

      queryClient.invalidateQueries({ queryKey: ['auth', 'apiKey', 'list'] });
    },
  });

  const healthcheckQueryApiKey = useQuery({
    queryFn: async () => {
      const response = await apiClient.api.healthcheck.get({
        extraHeaders: {
          Authorization: `Bearer ${authApiKeyCreateMutation.data?.key}`,
          'X-Auth-Type': AuthType.API_KEY,
        },
      });

      return response.body;
    },
    queryKey: ['api', 'healthcheck'],
    enabled: false,
  });

  const form = useForm({
    resolver: zodResolver(CreateApiKeyRequestBodySchema),
    defaultValues: {
      name: '',
    },
  });

  return (
    <Page
      title="API Key Management"
      description="Create and manage your API keys"
    >
      <Card>
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            Generate a new API key for your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                authApiKeyCreateMutation.mutate(values);
              })}
              className="flex items-start gap-4"
            >
              <Stack direction="row" gap="1rem" className="items-end">
                <TextField
                  form={form}
                  name="name"
                  label="Key Name"
                  placeholder="e.g., Production API Key"
                  required
                />
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Key
                </Button>
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
            isLoading={authApiKeyListQuery.isLoading}
            error={authApiKeyListQuery.error}
            isEmpty={authApiKeyListQuery.data?.length === 0}
          >
            <Stack direction="column" gap="1rem">
              {authApiKeyCreateMutation.data && (
                <ApiKey
                  {...authApiKeyCreateMutation.data}
                  secret={authApiKeyCreateMutation.data.key}
                  key={authApiKeyCreateMutation.data.id}
                />
              )}
              <Button
                onClick={async () => {
                  const res = await healthcheckQueryApiKey.refetch();
                  console.log({ res });
                }}
              >
                Test Api Key
              </Button>
              {authApiKeyListQuery.data
                ?.filter(
                  (apiKey) => apiKey.id !== authApiKeyCreateMutation.data?.id,
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

export default ApiKeys;
