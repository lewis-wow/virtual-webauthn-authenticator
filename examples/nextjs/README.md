# Next.js Authentication Example with Better Auth & Passkeys

This is a simple Next.js application demonstrating authentication using [Better Auth](https://www.better-auth.com/) with passkeys support and Prisma ORM with SQLite.

## Features

- 🔐 Email & Password authentication
- 🔑 Passkey (WebAuthn) authentication
- 📊 Session management
- 🎨 UI components from `@repo/ui` workspace package
- 💾 SQLite database with Prisma ORM

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Modern browser with WebAuthn support (for passkeys)

### Installation

1. Install dependencies from the root of the monorepo:

```bash
pnpm install
```

2. Generate Prisma client and run migrations:

```bash
cd examples/nextjs
npx prisma generate
npx prisma migrate dev
```

3. Set up environment variables:

The `.env` file is already created with default values. For production, update `BETTER_AUTH_SECRET`:

```env
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="your-secret-key-change-this-in-production"
BETTER_AUTH_URL="http://localhost:3000"
```

4. Start the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
examples/nextjs/
├── prisma/
│   └── schema.prisma          # Database schema with Better Auth tables
├── src/
│   ├── app/
│   │   ├── api/auth/[...all]/ # Better Auth API routes
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/         # Email/password login
│   │   │   ├── register/      # User registration
│   │   │   └── passkey/       # Passkey authentication
│   │   └── page.tsx           # Home page with session display
│   ├── components/            # UI components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── passkey-auth.tsx
│   └── lib/
│       ├── auth.ts            # Better Auth server configuration
│       └── auth-client.ts     # Better Auth client configuration
├── .env                       # Environment variables
└── package.json
```

## Usage

### Email & Password Authentication

1. Navigate to `/auth/register` to create a new account
2. Enter your name, email, and password
3. After registration, you'll be automatically signed in

### Passkey Authentication

1. Navigate to `/auth/passkey`
2. Click "Register Passkey" to create a new passkey using your device's biometric authentication or security key
3. Once registered, you can use "Sign In with Passkey" to authenticate

### Session Information

When authenticated, the home page (`/`) displays:

- User ID
- Name
- Email
- Session ID
- Session expiration time

## Technologies Used

- [Next.js 15](https://nextjs.org/) - React framework
- [Better Auth](https://www.better-auth.com/) - Authentication library
- [Passkeys Plugin](https://www.better-auth.com/docs/plugins/passkey) - WebAuthn/passkey support
- [Prisma](https://www.prisma.io/) - ORM with SQLite
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [@repo/ui](../../packages/ui) - Shared UI components from workspace

## Database

The project uses SQLite with Prisma ORM. The database schema includes:

- `User` - User accounts
- `Session` - Active sessions
- `Account` - OAuth and password accounts
- `Passkey` - WebAuthn credentials
- `Verification` - Email verification tokens

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration-name>

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Environment Variables

| Variable             | Description                   | Default                 |
| -------------------- | ----------------------------- | ----------------------- |
| `DATABASE_URL`       | SQLite database URL           | `file:./dev.db`         |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth    | -                       |
| `BETTER_AUTH_URL`    | Base URL for Better Auth      | `http://localhost:3000` |
| `BETTER_AUTH_RP_ID`  | Relying Party ID for WebAuthn | `localhost`             |

## Learn More

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Next.js Integration](https://www.better-auth.com/docs/integrations/next)
- [Passkeys Plugin](https://www.better-auth.com/docs/plugins/passkey)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
