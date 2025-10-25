'use client';

import { ApiKey } from '@/components/ApiKey';
import { Button } from '@/components/Button';
import { ContentContainer } from '@/components/ContentContainer';
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
import { fetchClient } from '@/lib/api/client';
import { authClient } from '@/lib/authClient';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateApiKeyRequestBodySchema,
  CreateApiKeyResponseSchema,
  ListApiKeysResponseSchema,
} from '@repo/validation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const ApiKeys = () => {
  const queryClient = useQueryClient();

  const authApiKeyListQuery = useQuery({
    queryKey: ['auth.apiKey.list'],
    queryFn: async () => {
      const response = await fetch('/api/auth/api-keys', {
        method: 'GET',
      });

      const data = await response.json();

      return ListApiKeysResponseSchema.parse(data);
    },
  });

  const authApiKeyCreateMutation = useMutation({
    mutationFn: async (opts: { name: string }) => {
      const { data } = await fetchClient.POST('/auth/api-keys', {
        body: {
          name: opts.name,
        },
      });

      return CreateApiKeyResponseSchema.parse(data);
    },
    onSuccess: () => {
      form.reset();

      toast('API key has been created.', {
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo'),
        },
      });

      queryClient.invalidateQueries({ queryKey: ['auth.apiKey.list'] });
    },
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
          <ContentContainer
            isLoading={authApiKeyListQuery.isLoading}
            error={authApiKeyListQuery.error}
            isEmpty={authApiKeyListQuery.data?.length === 0}
          >
            <Stack direction="column" gap="1rem">
              {authApiKeyListQuery.data?.map((apiKey) => (
                <ApiKey {...apiKey} name={apiKey.name!} key={apiKey.id} />
              ))}
            </Stack>
          </ContentContainer>
        </CardContent>
      </Card>
    </Page>
  );
};

export default ApiKeys;
