# How to start (development)

## Prerequisites

- Node.js 18+
- pnpm
- Docker + Docker Compose

## Steps

### 1) Install dependencies

```bash
pnpm install
```

### 2) Start infrastructure

```bash
./docker-compose-test.sh
```

### 3) Build packages and applications

```bash
pnpm build
```

### 4) Migrate database

```bash
pnpm --filter '@repo/prisma' db:migrate
```

### 5) Run in development mode

Start all services, excluding the example relying party app:

```bash
pnpm dev --filter '!@repo/nextjs-example'
```

And go to [http://localhost:3006](http://localhost:3006) to setup authenticator and API keys in Console application.

## Screens

### 1) Create virtual authenticator

![Create virtual authenticator](./how-to-start-assets/1_create_virtual_authenticator.png)

### 2) Set authenticator active

![Set authenticator active](./how-to-start-assets/2_set_authenticator_active.png)

### 3) Create API key

![Create API key](./how-to-start-assets/3_create_api_key.png)

### 4) Copy created API key

![Copy created API key](./how-to-start-assets/4_copy_created_api_key.png)

### 5) Paste API key to extension

![Paste API key to extension](./how-to-start-assets/5_paste_api_key_to_extension.png)

### 6) Test the authenticator

![Test the authenticator](./how-to-start-assets/6_test_the_authenticator.png)
