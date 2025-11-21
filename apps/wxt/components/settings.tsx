import { Button } from '@repo/ui/components/Button';
import { TextField } from '@repo/ui/components/TextField';
import { useForm } from 'react-hook-form';

function Settings() {
  const form = useForm<{ apiKey: string }>({});

  const onSubmit = (data: unknown) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <TextField label="API Key" form={form as unknown as any} name="apiKey" />
      <Button type="submit" style={{ marginTop: 16 }}>
        Save
      </Button>
    </form>
  );
}

export default Settings;
