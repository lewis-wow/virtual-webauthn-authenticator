# React Hook Form

Used in `apps/console` (Next.js admin UI) and `apps/wxt` (browser extension popup) for forms, via shared field components in `packages/ui`. All three depend on `react-hook-form` + `@hookform/resolvers` (the Zod resolver). Conventions below are observed in `apps/console/src/components/pages/ApiKeysPage.tsx`, `apps/console/src/components/pages/VirtualAuthenticatorsPage.tsx`, `apps/wxt/components/settings.tsx`, and the field primitives in `packages/ui/src/components`.

## `useForm` + `zodResolver`, driven by a `*FormSchema` from `@repo/contract`

The standard shape is `useForm({ resolver: zodResolver(SomeFormSchema), defaultValues: {...} })`, where `SomeFormSchema` is a `*FormSchema` exported from `@repo/contract/dto` (see [zod.md](./zod.md) for the naming convention):

```ts
// apps/console/src/components/pages/ApiKeysPage.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateApiKeyBodySchema, CreateApiKeyFormSchema } from '@repo/contract/dto';

const form = useForm({
  resolver: zodResolver(CreateApiKeyFormSchema),
  defaultValues: { name: '', enabled: true, expiresAt: null, permissions: [] },
});
```

`*FormSchema` and `*BodySchema` are usually siblings derived from the same base schema (e.g. both `CreateApiKeyFormSchema` and `CreateApiKeyBodySchema` `.pick()` the same field set off `ApiKeySchema`/`ApiKeyDtoSchema`), but they are not always identical — the form schema is what the UI accepts and validates against, the body schema is what the wire format looks like. On submit, form values are re-encoded through the body schema before being sent (see the codec pattern below).

When the fields being validated don't need to round-trip through the contract (e.g. a page-local PIN field that never becomes part of the request body verbatim), a small schema is defined inline in the page instead of importing one from `@repo/contract`:

```ts
// apps/console/src/components/pages/VirtualAuthenticatorsPage.tsx
const CreateAuthenticatorFormSchema = z.object({
  pin: z.string().min(4, 'PIN must be at least 4 characters.'),
});
```

Prefer importing a `*FormSchema` from `@repo/contract/dto` when the form maps directly onto a contract DTO; define one locally in the page only for small, page-specific inputs that aren't part of a shared contract.

`apps/wxt` (the extension popup) uses `useForm` without a resolver for its one-field API key input (`apps/wxt/components/settings.tsx`, `useForm<{ apiKey: string }>()`) — schema validation via `zodResolver` is the norm once a form has more than a trivial, single free-text field, but isn't mandatory for everything.

## Submitting: `handleSubmit` + `BodySchema.encode(...)`

Values collected by the form schema aren't sent to the API as-is — they're passed through the corresponding `*BodySchema`'s `.encode()` (a Zod v4 codec, see [zod.md](./zod.md)) to convert domain types (e.g. `Date`, `Duration`) into the wire representation, then handed to the ts-rest mutation:

```ts
<form
  onSubmit={form.handleSubmit((values) => {
    const encodedValues = CreateApiKeyBodySchema.encode(values);
    authApiKeyCreateMutation.mutate({ body: encodedValues });
  })}
>
```

After a successful mutation, `form.reset({...})` is called in the mutation's `onSuccess` to clear the form back to its default values — reset happens as a side effect of the mutation succeeding, not inline in the submit handler.

## Shared field components (`packages/ui`) wrap `FormField`, not raw `register`

Fields are never wired with `register()`. Every field in `packages/ui/src/components` (`TextField.tsx`, `SelectField.tsx`, `TreeViewField.tsx`) follows the same shape:

1. Pull `form` off `useFormContext()` (the page provides context via `<Form {...form}>`, see below).
2. Render shadcn/ui's `FormField` from `@repo/ui/components/ui/form`, passing `control={form.control}` and `name`.
3. Inside `render={({ field }) => ...}`, spread/wire `field` onto the underlying UI primitive and wrap it in the shared `FormItemContainer` (label, hint, required indicator, description, `FormMessage` for errors).

```ts
// packages/ui/src/components/TextField.tsx
export const TextField = ({ type = 'text', autoComplete, ...commonProps }: TextFieldProps) => {
  const form = useFormContext();
  const { name, placeholder, ...formItemContainerProps } = commonProps;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItemContainer {...formItemContainerProps}>
          <FormControl>
            <Input autoComplete={autoComplete} placeholder={placeholder} type={type} {...field} />
          </FormControl>
        </FormItemContainer>
      )}
    />
  );
};
```

All field components accept the shared `CommonFieldProps` type (`packages/ui/src/types.ts`: `name`, `label`, `hint`, `placeholder`, `description`, `required`, `className`) plus whatever is specific to that field. When adding a new field primitive to `packages/ui`, follow this exact shape rather than reaching for `register` or building a standalone controlled input.

`SelectField` is the reference for fields whose form value isn't a primitive: it bridges a rich `value` (any type, matched with `isEqual` from `lodash-es`) to the string index Radix's `Select` needs, translating back to the real value in `onValueChange` via `field.onChange`. `TreeViewField` follows the same bridge pattern through a domain mapper (`PermissionMapper.toTreeIds` / `fromTreeIds`) instead of a plain index. Use this bridging approach — not `field.value`/`field.onChange` wired directly to a non-primitive UI control — whenever a field's form value isn't already string/boolean/number-shaped.

## Pages own `<Form {...form}>`, not individual fields

Pages call `useForm(...)`, then wrap the `<form>` element in shadcn's `Form` (which is just `FormProvider` re-exported from `@repo/ui/components/ui/form`):

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(...)}>
    <TextField name="name" label="Key Name" required />
    <SelectField name="expiresAt" label="Expires at" items={EXPIRATION_OPTIONS} />
  </form>
</Form>
```

Field components then reach the form via `useFormContext()` — pages never pass `form` or `control` down as props to `TextField`/`SelectField`/`TreeViewField`. All fields are controlled through this shared context; there is no uncontrolled (`ref`-based, `register()`) usage anywhere in this codebase.

## Errors: `FormMessage`, not manual `formState.errors` checks

Validation errors surface through `packages/ui/src/components/ui/form.tsx`'s `FormMessage`, rendered automatically inside `FormItemContainer`. `FormMessage` reads the field's error via `useFormField()` (which combines `useFormContext` + `useFormState` + `getFieldState`) and renders `error.message` if present, otherwise falls back to any static `children` passed in, or renders nothing:

```ts
// packages/ui/src/components/ui/form.tsx
const body = error ? String(error?.message ?? '') : props.children;
if (!body) return null;
```

Pages/consumers never read `form.formState.errors.someField` directly to render an inline error — the field components + `FormItemContainer` + `FormMessage` handle it uniformly. Error copy comes from the Zod schema's own messages (e.g. `z.string().min(4, 'PIN must be at least 4 characters.')`), not from ad hoc strings in the component.

## Docs

Official docs: https://react-hook-form.com/docs

React Hook Form does not publish an official `llms.txt` (verified — 404). If you need something not covered by the conventions above (field arrays, watch/subscribe patterns, custom resolvers, performance tuning), check the official docs linked above rather than guessing.
