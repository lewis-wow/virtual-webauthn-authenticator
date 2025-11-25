'use client';

// The "New Key" display component
import { ApiKeysTable } from '@/components/ApiKeys/ApiKeysTable';
import { NewApiKey } from '@/components/ApiKeys/NewApiKey';
// Components
import { Page } from '@/components/Page/Page';
import { $authServer } from '@/lib/tsr';
import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { CreateApiKeyRequestBodySchema } from '@repo/contract/validation';
import type { Duration } from '@repo/core/validation';
// The new standalone table
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

const ApiKeysPage = () => {
  const queryClient = $authServer.useQueryClient();

  // --- Queries & Mutations ---
  const authApiKeysListQuery = $authServer.api.auth.apiKeys.list.useQuery({
    queryKey: [...'api.auth.apiKeys.list'.split('.')],
  });

  const authApiKeyCreateMutation =
    $authServer.api.auth.apiKeys.create.useMutation({
      onSuccess: () => {
        form.reset({
          name: '',
          enabled: true,
          expiresAt: null,
          permissions: [],
        });
        toast('API key has been created.');
        queryClient.invalidateQueries({
          queryKey: ['api', 'auth', 'apiKeys', 'list'],
        });
      },
    });

  // --- Form ---
  const form = useForm({
    resolver: effectTsResolver(CreateApiKeyRequestBodySchema),
    defaultValues: {
      name: '',
      enabled: true,
      expiresAt: null,
      permissions: [],
    },
  });

  // --- Data Processing ---
  const allKeys = authApiKeysListQuery.data?.body || [];
  // REMOVED: The logic that filtered newKeyId out.
  // We now want the new key to appear in the table immediately.

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
                const encodedValues = Schema.encodeSync(
                  CreateApiKeyRequestBodySchema,
                )(values);
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
      {/* We keep this because it is the ONLY time the user can copy the plaintextKey */}
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
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>Manage your existing access keys.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* REMOVED: isEmpty prop. The table will now render even if allKeys is empty */}
          <Guard
            isLoading={authApiKeysListQuery.isLoading}
            error={authApiKeysListQuery.error}
          >
            <ApiKeysTable
              data={allKeys}
              onDelete={(id) => {
                toast.error('Delete logic not implemented in this demo', {
                  description: `ID: ${id}`,
                });
              }}
            />
          </Guard>
        </CardContent>
      </Card>
    </Page>
  );
};

export default ApiKeysPage;
