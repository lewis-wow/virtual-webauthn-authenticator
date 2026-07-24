# @repo/dependency-container

A lightweight dependency-injection container for the Hono-based apps (`apps/api-bff`, `apps/auth-server`, `apps/console`) that don't get NestJS's built-in DI. Each of those apps builds a single `container.ts` with it to wire up shared singletons like the logger and token-fetching client, then resolves them from request handlers via the app's context.

`DependencyContainer` wraps `awilix` (in proxy injection mode) behind a small, fully-typed builder API: `register(name, factory)` returns a new container type with that dependency's return type folded into a `$dependencies` map, so `resolve(name)` is type-checked and autocompletes without any manual type annotations. It exists purely to give these apps compile-time-safe DI with an ergonomics-first API, rather than pulling in a full framework.
