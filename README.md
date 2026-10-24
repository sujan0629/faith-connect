# FaithConnect

A mobile-first community application connecting people and faith leaders, with a React Native client, a NestJS API, and shared TypeScript contracts in a pnpm/Turborepo workspace.

<img src="mobile/assets/design/home.jpeg" alt="FaithConnect mobile home interface" width="280" />

## Explore the system

| Package | Responsibilities |
| --- | --- |
| [mobile](mobile) | Expo Router screens, feed/video interfaces, profiles, messages, and client state |
| [backend](backend) | NestJS API, MongoDB models, authentication, upload and communication integration code |
| [shared](shared) | DTOs, validation, constants, and shared TypeScript definitions |

See the [backend guide](backend/README.md) for endpoint details and the [mobile guide](mobile/README.md) for interface structure. Features require their corresponding backend and provider configuration.

## Run locally

Use the package manager declared by the root package.json (pnpm 8.15.0). Install a Node version compatible with the NestJS 11 backend and the Expo app, then:

```bash
pnpm install
pnpm build:shared
```

Copy `backend/.env.example` to an untracked `backend/.env` and configure MongoDB, distinct JWT secrets, and any enabled email/upload services. Point the mobile API client at a reachable backend address.

```bash
pnpm dev
```

Individual entry points are `pnpm dev:backend`, `pnpm dev:mobile`, and `pnpm dev:shared`. Other root scripts include `pnpm build`, `pnpm lint`, and `pnpm test`.

## Operational boundaries

Client keep-alive pings do not guarantee background execution or an always-on server. Provider availability, token configuration, uploads, and notification delivery need testing in the environment you deploy. Replace development secret defaults before using a shared instance; this README does not assert a security audit or production availability guarantee.
