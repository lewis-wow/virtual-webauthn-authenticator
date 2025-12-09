# Self-Hosted Deployment

This application can be self-hosted using Docker Compose.

## Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd diploma_thesis

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

The application will be available at `http://localhost:3000`

## Architecture

- **Port 3000**: Public-facing nginx reverse proxy (only exposed port)
- **Internal services**:
  - Console (Next.js) - Main UI
  - NestJS API - Backend API
  - PostgreSQL - Database
  - Lowkey Vault - Key management
  - Assumed Identity - Identity service

All internal services communicate over a private Docker network and are not accessible from outside.

## Configuration

Create a `.env` file in the project root with required secrets:

```bash
# Required for auth-server
ENCRYPTION_KEY=your-secret-encryption-key-here
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
```

To generate a secure encryption key:

```bash
openssl rand -hex 32
```

Environment variables can also be configured directly in `docker-compose.prod.yml`.

## Stopping

```bash
docker compose -f docker-compose.prod.yml down

# Remove volumes (WARNING: deletes all data)
docker compose -f docker-compose.prod.yml down -v
```

## Production Considerations

1. **Use secrets** for sensitive data (database passwords, API keys)
2. **Configure SSL/TLS** with a reverse proxy like Traefik or Caddy
3. **Set up backups** for PostgreSQL data volume
4. **Configure resource limits** in docker-compose.prod.yml
5. **Use proper domain** and configure DNS
6. **Monitor logs** and set up alerting
