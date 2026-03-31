'use client';

import { Page } from '@/components/Page/Page';
import { $api } from '@/lib/tsr';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateVirtualAuthenticatorBodySchema,
  VirtualAuthenticatorDtoSchema,
} from '@repo/contract/dto';
import { Button } from '@repo/ui/components/Button';
import { DeleteConfirmDialog } from '@repo/ui/components/DeleteConfirmDialog';
import { Guard } from '@repo/ui/components/Guard/Guard';
import { Stack } from '@repo/ui/components/Stack';
import { TextField } from '@repo/ui/components/TextField';
import { Badge } from '@repo/ui/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { Form } from '@repo/ui/components/ui/form';
import { VirtualAuthenticatorUserVerificationType } from '@repo/virtual-authenticator/enums';
import { CheckCircle, Plus, Shield, ShieldCheck, Trash } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type VirtualAuthenticator = z.infer<typeof VirtualAuthenticatorDtoSchema>;

const CreateAuthenticatorFormSchema = z.object({
  pin: z.string().min(4, 'PIN must be at least 4 characters.'),
});

export const VirtualAuthenticatorsPage = () => {
  const queryClient = $api.useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  // --- Queries ---
  const listQuery = $api.api.virtualAuthenticators.list.useQuery({
    queryKey: ['api', 'virtualAuthenticators', 'list'],
    queryData: {
      query: {
        limit: 10,
      },
    },
  });

  // --- Mutations ---
  const createMutation = $api.api.virtualAuthenticators.create.useMutation({
    onSuccess: () => {
      form.reset({ pin: '' });
      toast.success('Virtual authenticator has been created.');
      void queryClient.invalidateQueries({
        queryKey: ['api', 'virtualAuthenticators', 'list'],
      });
    },
    onError: () => {
      toast.error('Failed to create virtual authenticator.');
    },
  });

  const deleteMutation = $api.api.virtualAuthenticators.delete.useMutation({
    onSuccess: () => {
      toast.success('Virtual authenticator has been deleted.');
      void queryClient.invalidateQueries({
        queryKey: ['api', 'virtualAuthenticators', 'list'],
      });
      setShowDeleteDialog(null);
    },
    onError: () => {
      toast.error('Failed to delete virtual authenticator.');
    },
  });

  const updateMutation = $api.api.virtualAuthenticators.update.useMutation({
    onSuccess: () => {
      toast.success('Virtual authenticator has been updated.');
      void queryClient.invalidateQueries({
        queryKey: ['api', 'virtualAuthenticators', 'list'],
      });
    },
    onError: () => {
      toast.error('Failed to update virtual authenticator.');
    },
  });

  // --- Form ---
  const form = useForm({
    resolver: zodResolver(CreateAuthenticatorFormSchema),
    defaultValues: {
      pin: '',
    },
  });

  // --- Data ---
  const authenticators = (listQuery.data?.body?.data ??
    []) as VirtualAuthenticator[];

  return (
    <Page pageTitle="Virtual Authenticators">
      {/* --- Create Section --- */}
      <Card>
        <CardHeader>
          <CardTitle>Create Virtual Authenticator</CardTitle>
          <CardDescription>
            Create a new virtual authenticator with a PIN for user verification
            during WebAuthn operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                createMutation.mutate({
                  body: CreateVirtualAuthenticatorBodySchema.encode({
                    userVerificationType:
                      VirtualAuthenticatorUserVerificationType.PIN,
                    pin: values.pin,
                  }),
                });
              })}
            >
              <Stack direction="column" gap="1.5rem" className="w-full">
                <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <TextField
                      name="pin"
                      label="PIN"
                      placeholder="Enter a PIN (min 4 characters)"
                      autoComplete="off"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={createMutation.isPending}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Authenticator
                  </Button>
                </div>
              </Stack>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* --- Authenticators List --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Your Virtual Authenticators</CardTitle>
          </div>
          <CardDescription>
            Manage your virtual authenticators. Mark one as active to use it for
            WebAuthn operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Guard isLoading={listQuery.isLoading} error={listQuery.error}>
            {authenticators.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Shield className="mb-3 h-10 w-10" />
                <p className="text-sm">No virtual authenticators yet.</p>
                <p className="text-xs">Create one above to get started.</p>
              </div>
            ) : (
              <Stack direction="column" gap="0.75rem">
                {authenticators.map((authenticator) => (
                  <div
                    key={authenticator.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      {authenticator.isActive ? (
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <Shield className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {authenticator.userVerificationType === 'PIN'
                              ? 'PIN Authenticator'
                              : 'Authenticator'}
                          </span>
                          {authenticator.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          <Badge variant="outline">
                            {authenticator.userVerificationType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created{' '}
                          {new Date(
                            authenticator.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!authenticator.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateMutation.mutate({
                              params: { id: authenticator.id },
                              body: { isActive: true },
                            })
                          }
                          disabled={updateMutation.isPending}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Set Active
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-600"
                        onClick={() => setShowDeleteDialog(authenticator.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </Stack>
            )}
          </Guard>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={showDeleteDialog !== null}
        onOpenChange={(open) => {
          if (!open) setShowDeleteDialog(null);
        }}
        title="Delete Virtual Authenticator?"
        description="This will permanently delete the virtual authenticator and all its associated credentials. This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (showDeleteDialog) {
            deleteMutation.mutate({ params: { id: showDeleteDialog } });
          }
        }}
        isPending={deleteMutation.isPending}
      />
    </Page>
  );
};
