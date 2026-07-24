# @repo/logger

A thin, shared wrapper around `consola` so every service and package in the monorepo logs through the same interface instead of reaching for `console` directly. Each `Logger` instance is tagged with a `prefix` at construction time (e.g. `new Logger({ prefix: 'ASSERT_SCHEMA' })`), which `consola` uses to namespace output, and log level defaults to `info` unless overridden per instance.

It exposes the usual `.info()`, `.warn()`, `.error()`, and `.debug()` methods, plus two exception-oriented helpers: `.exception(error, message?)` logs an `Error` at the error level with the error attached as metadata, and `.exceptionOrError(exception, message)` handles the common `catch (exception: unknown)` case by routing real `Error` instances through `.exception()` and logging anything else as a plain error with the unknown value attached. `LogLevel` and `mapLogLevelTag` round out the package, letting callers parse a log level out of a string (e.g. an env var) safely.
