import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@repo/ui/components/Button'
import { TextField } from '@repo/ui/components/TextField'

const schema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
})

type FormValues = z.infer<typeof schema>

function Settings() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormValues) => {
    console.log(data)
  }

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
  )
}

export default Settings
