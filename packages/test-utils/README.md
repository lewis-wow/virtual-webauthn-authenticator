# @repo/test-utils

Small helpers shared by integration tests across the repo (used in `apps/nestjs/__tests__` and `packages/virtual-authenticator-agent/__tests__`), so test setup code for building and mutating fixture data doesn't get copy-pasted between test suites.

It provides `set`, an immutable deep-update helper for building variations of a fixture object without hand-writing spreads (arrays and primitives are replaced wholesale, nested objects are merged recursively, and any field can be given as a plain value or an updater function); `setDeep`, a `lodash-es`-backed variant that updates a single value at a dot-path via an updater function; and `WRONG_UUID`, a well-known invalid-but-well-formed UUID constant used for negative test cases (e.g. "resource not found").
