# @repo/enums

A small home for truly generic, cross-cutting enums that have no single domain package to belong to. Domain-specific enums live next to the package that owns that domain instead — permissions in `@repo/auth`, log actions/entities in `@repo/activity-log`, and so on — so this package stays limited to constants any part of the system might need regardless of feature area.

It currently owns `Environment` (`production`/`development`/`test`, for branching on runtime environment) and `Time` (millisecond-based duration constants — `SECONDS`, `MINUTES`, `HOURS`, `DAYS`, `WEEKS`) used wherever code needs to express a duration without hardcoding magic numbers.
