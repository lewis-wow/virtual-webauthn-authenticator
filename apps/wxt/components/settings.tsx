import { apiKeyItem } from '@/utils/storage';
import { Button } from '@repo/ui/components/Button';
import { Guard } from '@repo/ui/components/Guard/Guard';
import { Page } from '@repo/ui/components/Page';
import { Stack } from '@repo/ui/components/Stack';
import { TextField } from '@repo/ui/components/TextField';
import { Form } from '@repo/ui/components/ui/form';
import { useForm } from 'react-hook-form';
import usePromise from 'react-use-promise';

export const Settings = () => {
  const [queryVersion, setQueryVersion] = useState(0);
  const invalidate = () => setQueryVersion((v) => v + 1);

  const [result, error, state] = usePromise(
    async () => await apiKeyItem.getValue(),
    [queryVersion],
  );

  const form = useForm<{ apiKey: string }>();

  return (
    <Page title="Virtual WebAuthn Authenticator">
      <Guard isLoading={state === 'pending'} error={error}>
        {(result?.length ?? 0) > 0 ? (
          <div>
            <Button
              variant="destructive"
              onClick={async () => {
                await apiKeyItem.removeValue();
                invalidate();
              }}
            >
              Delete API key
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                await apiKeyItem.setValue(values.apiKey);
                invalidate();
              })}
            >
              <Stack direction="column" gap="1rem">
                <TextField label="API Key" form={form} name="apiKey" />

                <Button type="submit">Save</Button>
              </Stack>
            </form>
          </Form>
        )}
      </Guard>
    </Page>
  );
};
