# @repo/ui

It exists so the browser extension (`apps/wxt`) and the admin console (`apps/console`) share one visual language and one set of interactive components instead of each app implementing its own buttons, forms, and tables. It's a shadcn/ui-based component library built on Radix primitives and Tailwind CSS.

It exports plain UI components (`./components/*`, including a dedicated `Typography` and a route-guarding `Guard` component), React hooks (`./hooks/*`), context providers (`./context/*`), data-shaping helpers (`./mappers`), general utilities (`./lib/*`), shared types (`./types`), and the base Tailwind stylesheet plus PostCSS config (`./globals.css`, `./postcss.config`) that consuming apps load to pick up the design tokens. See `.docs/shadcn.md` for the conventions behind how these components are structured.
