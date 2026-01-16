# FaithConnect Monorepo

A modern full-stack application built with **pnpm workspaces** and **Turborepo** for efficient monorepo management.

## Structure

```
faithConnect/
├── backend/          # NestJS API
├── mobile/           # Expo React Native app
├── shared/           # Shared TypeScript types & DTOs
├── turbo.json        # Turborepo configuration
└── pnpm-workspace.yaml  # pnpm workspace config
```

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0

Install pnpm globally:
```bash
npm install -g pnpm@8.15.0
```

## Setup

### Install Dependencies

```bash
# Install all dependencies (root + all workspaces)
pnpm install
```

That's it! pnpm will automatically install dependencies for all workspaces and link them together.

### Running the Apps

**All services with Turbo TUI**:
```bash
pnpm dev
```
This starts backend, mobile, and shared in watch mode with a beautiful terminal UI.

**Individual services**:
```bash
# Backend only
pnpm dev:backend

# Mobile only
pnpm dev:mobile

# Shared (watch mode)
pnpm dev:shared
```

**Build**:
```bash
# Build all packages
pnpm build

# Build shared only
pnpm build:shared
```

## Shared Package

The `shared` folder contains TypeScript definitions shared between backend and mobile:

- **Types**: User types, roles, auth responses
- **DTOs**: Request/response interfaces for API endpoints
- **Constants**: Shared enums and constants

### Using Shared Types

**Backend (NestJS)**:
```typescript
import type { Role, UserProfile } from '@faithconnect/shared';
```

**Mobile (React Native)**:
```typescript
import type { Role, UserProfile } from '@faithconnect/shared';
```

## Benefits

1. **Type Safety**: Shared types ensure frontend and backend stay in sync
2. **Single Source of Truth**: DTOs defined once, used everywhere
3. **Refactoring**: Changes to types propagate automatically
4. **Less Duplication**: No need to manually keep types in sync
5. **Fast Builds**: Turborepo caches build outputs and runs tasks in parallel
6. **Efficient Dependencies**: pnpm creates a single content-addressable store

## Development Workflow

1. Update types in `shared/src/`
2. Turborepo automatically rebuilds dependents
3. Backend and mobile hot-reload with updated types
4. TypeScript catches any breaking changes immediately

## Turborepo Features

- **Parallel Execution**: Runs tasks across workspaces simultaneously
- **Smart Caching**: Never rebuilds the same thing twice
- **Dependency Graph**: Understands workspace relationships
- **TUI Mode**: Beautiful terminal interface showing all running processes

## pnpm Features

- **Fast**: Up to 2x faster than npm
- **Efficient**: Saves disk space with content-addressable storage
- **Strict**: Better dependency management and no phantom dependencies
- **Workspace Protocol**: Native monorepo support

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Run all services with Turbo TUI |
| `pnpm build` | Build all packages |
| `pnpm dev:backend` | Run backend only |
| `pnpm dev:mobile` | Run mobile only |
| `pnpm dev:shared` | Watch shared types |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |
## Cold Start Prevention (Render Free Tier)

The backend is hosted on Render's free tier, which puts services to sleep after 15 minutes of inactivity. We've implemented a multi-layered approach to keep the backend warm:

1. **Mobile App Keep-Alive**: Pings `/api/health` every 2 minutes (even when app is backgrounded)
2. **GitHub Actions Monitor**: Automatically pings backend every 10 minutes (24/7)
3. **Render Health Endpoint**: Lightweight `/api/health` endpoint for monitoring

👉 **See [COLD_START_FIX.md](./COLD_START_FIX.md) for detailed documentation and troubleshooting**