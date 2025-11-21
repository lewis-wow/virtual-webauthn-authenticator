import { Button } from '@repo/ui/components/Button';
import { TextField } from '@repo/ui/components/TextField';
import { useForm } from 'react-hook-form';

function Settings() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  const onSubmit = (data: unknown) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="API Key"
        {...register('apiKey')}
        error={errors.apiKey?.message}
      />
      <Button type="submit" style={{ marginTop: 16 }}>
        Save
      </Button>
    </form>
  );
}

export default Settings;
