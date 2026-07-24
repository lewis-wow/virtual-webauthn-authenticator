# shadcn/ui

`packages/ui` is the single source of truth for shadcn/ui primitives (`src/components/ui/*`) plus custom compositions built on top of them (`src/components/*.tsx`). `apps/console`, `apps/wxt`, and `examples/nextjs` each also ship a `components.json`, but in practice none of them keep local copies of primitives — every consuming app imports directly from `@repo/ui`. Conventions below reflect what's actually in the repo, not a generic shadcn tutorial.

## Only `packages/ui`'s `components.json` is "real"

All four `components.json` files use `"style": "new-york"`, `"baseColor": "neutral"`, `"cssVariables": true`, `"iconLibrary": "lucide"`, and point `tailwind.css` at `packages/ui/src/styles/globals.css` (directly for `packages/ui` itself, via a relative `../../packages/ui/src/styles/globals.css` from `apps/console`, `apps/wxt`, and `examples/nextjs`). The difference that matters is the `aliases` block:

- `packages/ui/components.json` — aliases resolve to the package's own public import paths: `"components": "@repo/ui/components"`, `"utils": "@repo/ui/lib/utils"`, `"ui": "@repo/ui/components/ui"`. Running the shadcn CLI here is what actually adds/updates a primitive, and it lands in `packages/ui/src/components/ui/*`.
- `apps/console/components.json` and `apps/wxt/components.json` — `"ui"`/`"utils"` also point back into `@repo/ui` (`@repo/ui/components/ui`, `@repo/ui/lib/utils`), so even if the CLI were run from these apps, generated primitives would still resolve into the shared package, not a local copy.
- `examples/nextjs/components.json` — the odd one out: `"ui": "@/components/ui"` and `"utils": "@/lib/utils"` point at local paths that don't exist in that app (there is no `examples/nextjs/src/components/ui` or `src/lib/utils.ts`). The app only ever imports primitives from `@repo/ui/components/ui/*` directly (see `src/components/login-form.tsx`, `src/components/passkey-auth.tsx`). Treat this file as vestigial — **add or change primitives in `packages/ui`, not by running the CLI inside `examples/nextjs`.**

Bottom line: to add a new shadcn primitive, run the CLI from `packages/ui` (or hand-write the file following the existing style) so it lands in `packages/ui/src/components/ui/`, then consume it from every app via `@repo/ui/components/ui/<name>`.

## Two layers: raw shadcn primitives vs. custom compositions

`packages/ui/src/components/ui/*` holds unmodified-in-spirit shadcn primitives (`button.tsx`, `card.tsx`, `dialog.tsx`, `form.tsx`, `sidebar.tsx`, `sonner.tsx`, etc. — the standard shadcn "new-york" set). `packages/ui/src/components/*.tsx` (one directory up) holds this repo's own compositions built on those primitives — e.g. `Button.tsx` wraps `ui/button.tsx` to add an `isLoading` prop and a `Spinner`, `DeleteConfirmDialog.tsx` wraps `ui/alert-dialog.tsx` into a ready-made confirm dialog, `TextField`/`SelectField`/`FormItemContainer` wrap `ui/form.tsx` + `react-hook-form`'s `useFormContext` into label/hint/error-aware form fields, and `Stack.tsx`/`Guard/Guard.tsx` are repo-specific layout/async-state helpers with no shadcn origin at all. When building a new field or dialog, check whether a composition already exists here before reaching for the raw primitive — app code (`apps/console/src/components/pages/*`) imports the compositions (`@repo/ui/components/Button`, `@repo/ui/components/TextField`) far more often than the raw `ui/*` primitives directly.

Example composition, `packages/ui/src/components/Button.tsx`:

```tsx
import { Button as ButtonUI, type buttonVariants } from '@repo/ui/components/ui/button';
import { Spinner } from '@repo/ui/components/ui/spinner';
import { cn } from '@repo/ui/lib/utils';
import { type VariantProps } from 'class-variance-authority';
import { match } from 'ts-pattern';

export const Button = ({ isLoading, children, className, asChild, ...restProps }: ButtonProps) => {
  return (
    <ButtonUI {...restProps} asChild={!isLoading && asChild} className={cn('cursor-pointer', className)}>
      {match({ isLoading })
        .with({ isLoading: true }, () => <Spinner />)
        .otherwise(() => children)}
    </ButtonUI>
  );
};
```

## `cva` for variants, plain prop objects for one-offs

Multi-variant primitives use `class-variance-authority` exactly the way shadcn generates them — see `packages/ui/src/components/ui/button.tsx`'s `buttonVariants = cva(base, { variants: { variant: {...}, size: {...} }, defaultVariants: {...} })`, exported alongside the component and re-typed with `VariantProps<typeof buttonVariants>` wherever a wrapper needs to forward `variant`/`size` (e.g. `Button.tsx`'s `ButtonProps`). For simpler binary/conditional styling that doesn't warrant a variant map, components just pass a conditional object straight into `cn()` instead of defining `cva` variants — see `DeleteConfirmDialog.tsx`: `cn('cursor-pointer', { 'bg-destructive text-destructive-foreground hover:bg-destructive/90': isDestructive })`. Reach for `cva` when a component has a real `variant`/`size` axis; use a `cn()` conditional object for a single boolean toggle.

## `cn()` utility

`packages/ui/src/lib/utils.ts` is the one and only `cn` implementation (`clsx` + `tailwind-merge`), exported as `@repo/ui/lib/utils`:

```ts
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

Every component that merges class names imports it from there (`import { cn } from '@repo/ui/lib/utils'`) — even `packages/ui`'s own internal files use the public `@repo/ui/lib/utils` specifier rather than a relative import in most places (though `FormItemContainer.tsx` uses a relative `../lib/utils`, both resolve to the same file). Never redefine a local `cn` in an app.

## Tailwind v4: CSS-first config, no `tailwind.config.js`

There is no `tailwind.config.ts`/`.js` anywhere in the repo (Tailwind v4's CSS-based config). Everything lives in `packages/ui/src/styles/globals.css`:

- `@import 'tailwindcss';` plus `@import 'tw-animate-css';` at the top.
- `@source` directives tell Tailwind v4 where to scan for class usage across the monorepo, since the CSS file lives in `packages/ui` but consuming apps' source isn't under it by default: `@source "../../../apps/**/*.{ts,tsx}";`, `@source "../../../components/**/*.{ts,tsx}";`, `@source "../**/*.{ts,tsx}";`. If a new app/package needs Tailwind classes picked up from its source tree, it needs a matching `@source` glob added here.
- `@custom-variant dark (&:is(.dark *));` defines the dark-mode variant (class-based, not `prefers-color-scheme`).
- An `@theme inline { ... }` block maps design tokens (`--color-background`, `--color-sidebar`, `--radius-lg`, etc.) to the CSS custom properties defined below, which is how Tailwind v4 wires arbitrary CSS variables into utility classes like `bg-background`.
- `:root { ... }` and `.dark { ... }` define the actual OKLCH color values for light/dark themes (`--background: oklch(1 0 0)`, etc.) — the standard shadcn "new-york + neutral" palette, unmodified.

Every app that wants Tailwind + the design tokens imports this one file — `import '@repo/ui/globals.css';` in each app's root `layout.tsx` (`apps/console/src/app/layout.tsx`, `examples/nextjs/src/app/layout.tsx`) — rather than maintaining its own globals.css. Each app still needs its own `postcss.config.mjs` referencing `@tailwindcss/postcss` (or re-exports `@repo/ui/postcss.config`, which the package exposes for that purpose) and `tailwindcss`/`@tailwindcss/postcss` as devDependencies so the Tailwind v4 PostCSS plugin actually runs, plus an `@source` covering its own `src/**` if it isn't already covered by the globs above.

## Consuming `@repo/ui` from apps: subpath exports, no barrel file

`packages/ui/package.json`'s `exports` map is the contract every app imports through — there is no single barrel `index.ts`:

```json
"exports": {
  "./globals.css": "./src/styles/globals.css",
  "./postcss.config": "./postcss.config.mjs",
  "./lib/*": "./src/lib/*.ts",
  "./context/*": "./src/context/*.tsx",
  "./components/Typography": "./src/components/Typography/index.tsx",
  "./components/*": "./src/components/*.tsx",
  "./hooks/*": "./src/hooks/*.ts",
  "./types": "./src/types.ts",
  "./mappers": "./src/mappers/index.tsx"
}
```

(`./components/*` matches both the custom compositions and, since the primitives live one level deeper, paths like `@repo/ui/components/ui/button` resolve through the same wildcard into `src/components/ui/button.tsx`.) Import with the specific subpath you need — `import { Button } from '@repo/ui/components/Button'`, `import { Badge } from '@repo/ui/components/ui/badge'`, `import { cn } from '@repo/ui/lib/utils'`, `import { Guard } from '@repo/ui/components/Guard/Guard'` — never a bare `@repo/ui` import. Every consuming app (`apps/console`, `apps/wxt`, `examples/nextjs`) also declares `@repo/ui: workspace:*` as a dependency and adds `transpilePackages: ['@repo/ui']` in `next.config.ts` (Next.js apps only), since the package ships TS/TSX source rather than a prebuilt bundle. When adding a new file to `packages/ui/src/components` (or `lib`/`hooks`/`context`), no export map change is needed as long as it fits an existing wildcard pattern — only add a new explicit export key for something that doesn't (like `./types` or `./mappers`).

## Docs

- llms.txt: https://ui.shadcn.com/llms.txt
- Official docs: https://ui.shadcn.com/docs

If you need to do something with shadcn/ui that isn't covered above (a component type not yet added to `packages/ui`, theming beyond the existing tokens, block/registry usage, etc.), check the official docs linked above rather than guessing or inventing a pattern that doesn't match how `packages/ui` already does things.
