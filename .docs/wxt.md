# WXT

Used in `apps/wxt`, the browser extension that intercepts the page's real `navigator.credentials` API and routes registration/authentication requests to the authenticator backend (see the root [README.md](../README.md)'s "About This Project"). It runs on [WXT](https://wxt.dev) (`wxt: ^0.20.13` in `apps/wxt/package.json`) with the official React module — the `plasmohq.svg` asset under `.architecture/assets/` is a leftover from an earlier Plasmo-based version; `wxt.config.ts` and `package.json` are the source of truth today. Conventions below are observed in that app, not generic WXT defaults.

## Three-world entrypoint split

`apps/wxt/entrypoints/` has exactly three entrypoints, each pinned to the browser-extension world it actually needs:

- `background.ts` — `defineBackground(() => { ... })`. Holds the ts-rest API client and the API key; this is the only place that talks to the authenticator backend.
- `content.tsx` — `defineContentScript({ matches: ['<all_urls>'], cssInjectionMode: 'ui', async main(ctx) { ... } })`. Runs in the isolated content-script world (has access to extension APIs, not the page's `navigator`), mounts the React dialog UI into a shadow root, and relays messages between the page and background.
- `main-world.ts` — `defineUnlistedScript(() => { ... })`. Runs in the page's own JS context (main world) via `injectScript('/main-world.js', { keepInDom: true })` called from `content.tsx`. This is the only file that actually reassigns `navigator.credentials.create`/`navigator.credentials.get`, because a content script's isolated world cannot override objects the page itself reads.
- `entrypoints/popup/index.html` + `main.tsx` — the toolbar popup, a plain Vite HTML entrypoint rendering `<Settings />`.

`defineBackground`, `defineContentScript`, `defineUnlistedScript`, `createShadowRootUi`, `injectScript`, and `browser` are WXT/`wxt/browser` auto-imports — they are used directly in entrypoints without an explicit import statement. Don't add one; check `.wxt/types` if you need to see what's auto-imported.

## `main-world.ts` is the only place that overrides WebAuthn

```ts
// apps/wxt/entrypoints/main-world.ts
navigator.credentials.create = async (opts?: CredentialCreationOptions) => {
  const publicKeyCredentialCreationOptions = convertBrowserCreationOptions(opts?.publicKey);
  const encodedPkOptions = PublicKeyCredentialCreationOptionsDtoSchema.encode(publicKeyCredentialCreationOptions!);
  const response = await mainWorldToContentScriptMessaging.sendMessage('credentials.create', {
    publicKeyCredentialCreationOptions: encodedPkOptions,
  });
  if (!response.ok) throw new Exception(response.error);
  const parsedPublicKeyCredential = PublicKeyCredentialDtoSchema.parse(response.data);
  return new PublicKeyCredentialImpl({ ... });
};
```

`navigator.credentials.get` follows the identical shape. Both convert the browser's native options via `@repo/virtual-authenticator/browser` helpers, encode them with the Zod DTO schemas from `@repo/virtual-authenticator/dto`, hand off across the main-world boundary, then reconstruct a real `PublicKeyCredential`-shaped object (`PublicKeyCredentialImpl`) from the response so the calling page code sees a normal WebAuthn credential. If you need to add a new intercepted WebAuthn method, it goes in `main-world.ts`, mirrored by a matching message type in `mainWorldToContentScriptMessaging.ts` and a handler in `content.tsx`.

## `web_accessible_resources` must expose `main-world.js`

`wxt.config.ts` declares:

```ts
manifest: {
  action: { default_popup: 'popup.html' },
  permissions: ['storage'],
  host_permissions: ['https://*/*', 'http://*/*'],
  web_accessible_resources: [{ resources: ['main-world.js'], matches: ['<all_urls>'] }],
},
```

`host_permissions` is intentionally `<all_urls>`-equivalent because this extension must intercept WebAuthn on any relying-party origin, not a fixed list. `permissions: ['storage']` backs `utils/storage.ts` (the API key). If you add a new unlisted/main-world script, it must be added to `web_accessible_resources` the same way `main-world.js` is, or `injectScript` will fail with a CSP/resource error.

`wxt.config.ts` also registers `@tailwindcss/vite` in the `vite()` factory (for `assets/tailwindcss.css`, used only by the content-script UI) and a `build:done` hook that zips `.output/chrome-mv3` and, if a local `key.pem` exists, packs a `.crx` via the `crx` package — this is packaging tooling, not something route/manifest-related to imitate elsewhere.

## Messaging: `@webext-core/messaging`, one file per boundary, always `Response<T>`

There is no `chrome.runtime.sendMessage` or webext-bridge in this app — every cross-world call goes through a typed channel from `@webext-core/messaging`, defined in `apps/wxt/messaging/`:

- `contentScriptToBackgroundScriptMessaging.ts` — `defineExtensionMessaging<...>()` (uses `chrome.runtime` under the hood) for content-script ↔ background.
- `mainWorldToContentScriptMessaging.ts` — `defineWindowMessaging<...>({ namespace: '...' })` (from `@webext-core/messaging/page`, uses `window.postMessage` under the hood) for main-world ↔ content-script, since the main world has no extension APIs at all.

Both files export a `*Protocol` type mapping message names (`'credentials.create'`, `'credentials.get'`) to `(req) => Response<T>`, and a `*Messaging` instance built from `defineExtensionMessaging`/`defineWindowMessaging`. `Response<T>` (`apps/wxt/types.ts`) is the shared discriminated union `{ ok: true; data: T } | { ok: false; error: AnyExceptionShape }` — every messaging handler returns this shape rather than throwing across a message boundary, since exceptions don't serialize across `postMessage`/`chrome.runtime` cleanly. Handlers are registered with `.onMessage('name', async (req) => ...)` and called with `.sendMessage('name', payload)`; see `content.tsx`'s registration of both message names and `main-world.ts`'s calls into it.

## User-interaction loop: `InteractionService` + `ts-pattern`, not a message reply

When the backend can't complete a WebAuthn ceremony without user input (pick a credential, confirm presence, enter a PIN), the background→content response comes back `{ ok: false, error: <SomeAgentException> }` instead of a hard failure. `content.tsx` loops on this:

```ts
while (true) {
  const response = await contentScriptToBackgroundScriptMessaging.sendMessage('credentials.create', { ...request.data, prevStateToken, nextState });
  if (response.ok) return response;
  const interactionResult = await interaction.emitInteraction('error', { response });
  if (interactionResult == null) return response;
  const { stateToken, ...userState } = interactionResult;
  prevStateToken = stateToken;
  nextState = { ...nextState, ...userState };
}
```

`interaction` (`utils/interaction.ts`) is a singleton `InteractionService` (`utils/InteractionService.ts`, a small typed `EventEmitter` wrapper) whose `emitInteraction('error', ...)` returns a `Promise` that only resolves once some UI calls back `resolve(...)`. `components/App.tsx` — mounted once per page by `content.tsx` into the shadow root — is the sole listener (`interaction.onInteraction('error', ...)`) and uses `ts-pattern`'s `match(...).when(isExceptionShape(SomeException), ...)` to pick which dialog to open (`CredentialOptionsDialog`, `UserPresenceDialog`, `UserVerificationDialog`, or `ErrorDialog`) based on the concrete exception class from `@repo/virtual-authenticator-agent/exceptions` / `@repo/virtual-authenticator/exceptions`. The dialog's `onConfirm`/`onCancel` calls `resolve(...)`/`resolve(null)`, which unblocks the loop in `content.tsx` and feeds the collected user state (`up`, `uv`, `stateToken`, etc.) back into the next `credentials.create`/`credentials.get` request. When adding a new recoverable-error UI, add a `.when(isExceptionShape(YourException), ...)` branch in `App.tsx` rather than inventing a new messaging round trip.

## Shadow DOM isolation for injected UI

`content.tsx` mounts React with `createShadowRootUi(ctx, { mode: 'closed', cssInjectionMode: 'ui', ... })` (a WXT helper) so the extension's dialogs render inside a closed shadow root on the host page, isolated from the page's own styles. `ShadowRootProvider`/`useShadowRoot` and `ExtensionDialogProvider`/`useExtensionDialog` (both from `@repo/ui/context/*`, not local to `apps/wxt`) wrap the tree so shadcn/ui portal-based components (dialogs, popovers) render their portals inside that shadow root instead of `document.body`. `App.tsx` itself renders no visible markup (`return null`) — it only listens for interaction events and calls `openDialog`/`closeDialog` from `ExtensionDialogContext` to swap in the right dialog component.

## Popup: `wxt-storage` item + React Hook Form, no validation schema

`utils/storage.ts` defines the API key as a WXT storage item:

```ts
export const apiKeyItem = storage.defineItem<string>('local:apiKey', { defaultValue: '' });
```

(`storage` is another WXT auto-import, backed by the `storage` manifest permission.) `components/settings.tsx` (rendered by the popup) reads it with `react-use-promise`'s `usePromise(() => apiKeyItem.getValue(), [queryVersion])` and a manual `queryVersion` counter to force a refetch after mutation — there is no React Query here, unlike other apps in this monorepo. The form itself is a bare `useForm<{ apiKey: string }>()` from `react-hook-form` with no Zod resolver (the API key field has no client-side validation), wired through the shared `@repo/ui/components/ui/form` `<Form>` wrapper and `@repo/ui/components/TextField`, following the same `<Form {...form}><form onSubmit={form.handleSubmit(...)}>` shape used elsewhere in the repo (see `.docs/react-hook-form.md`). Popup UI otherwise reuses `@repo/ui` primitives directly (`Button`, `Guard`, `Page`, `Stack`) rather than introducing extension-local component variants.

## `@repo/env-config` env, not raw `import.meta.env`

`env.ts` defines client-only env vars the same way other apps in the repo do:

```ts
export const env = defineEnv({
  clientPrefix: 'WXT_',
  client: { WXT_APP_NAME: z.string(), WXT_API_BASE_URL: z.url() },
  runtimeEnv: import.meta.env,
});
```

Values come from `.env.development` (`WXT_API_BASE_URL="http://localhost:3000"`) loaded through `dotenvx` — every `package.json` script (`dev`, `build`, `zip`, and their `:firefox` variants) is prefixed with `pnpm dotenvx wxt ...`, calling `../../scripts/dotenvx.sh`, not `wxt` directly. Always go through the `pnpm` script, not a bare `wxt` binary invocation, or env vars won't be injected.

`authClient.ts` (`createAuthClient` from `better-auth/react` with the `jwtClient` plugin) is set up the same way `apps/console`/`apps/api-bff` use Better Auth elsewhere in the repo, but as of this writing nothing in `apps/wxt` imports it — the popup authenticates purely via the static API key in `utils/storage.ts`. Check for new usages before assuming it's dead code if you're touching auth in this app.

## Build/dev commands

All scripts live in `apps/wxt/package.json` and are Chrome-by-default with an explicit `:firefox` variant:

- `pnpm --filter @repo/wxt dev` — `dotenvx wxt` (Chrome, dev server on port 3050 per `wxt.config.ts`'s `dev.server.port`).
- `pnpm --filter @repo/wxt dev:firefox` — `dotenvx wxt -b firefox`.
- `pnpm --filter @repo/wxt build` / `build:firefox` — `dotenvx wxt build [-b firefox]`, output to `.output/<target>`.
- `pnpm --filter @repo/wxt zip` / `zip:firefox` — `dotenvx wxt zip [-b firefox]`.
- `pnpm --filter @repo/wxt compile` — `tsc --noEmit` (this app has no dedicated lint/test script beyond the repo-root ones; there's a manual browser-console script at `__tests__/manual/helpers.js` for exercising `navigator.credentials.create` by hand, not a Vitest suite).

## Docs

- llms.txt: https://wxt.dev/llms.txt
- Official docs: https://wxt.dev/guide/introduction.html

If you need to do something with WXT that isn't covered by the conventions above (a new entrypoint type, manifest option, storage API, etc.), check the official docs linked above rather than guessing or inventing a pattern that doesn't match how this app already does things.
