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
import { tsr } from '@/lib/tsr';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { CreateApiKeyRequestBodySchema } from '@repo/validation';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const ApiKeys = () => {
  const queryClient = tsr.useQueryClient();

  const authApiKeysListQuery = tsr.api.auth.apiKeys.list.useQuery({
    queryKey: ['api', 'auth', 'apiKeys', 'list'],
  });

  const authApiKeyCreateMutation = tsr.api.auth.apiKeys.create.useMutation({
    onSuccess: () => {
      form.reset();

      toast('API key has been created.');

      queryClient.invalidateQueries({
        queryKey: ['api', 'auth', 'apiKeys', 'list'],
      });
    },
  });

  const form = useForm({
    resolver: standardSchemaResolver(CreateApiKeyRequestBodySchema),
    defaultValues: {
      name: '',
      enabled: true,
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
                authApiKeyCreateMutation.mutate({
                  body: CreateApiKeyRequestBodySchema.encode(values),
                });
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

export default ApiKeys;
