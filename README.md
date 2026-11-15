# Shabzak — Frontend (Angular)

> Angular 17 single-page app (with SSR) for **Shabzak (שבצ"ק)** — a military duty-scheduling system that assigns soldiers to mission time-slots. This is the UI for the [`ShabzakAPI`](../ShabzakAPI) backend.

The interface is **Hebrew / RTL**. "שבצ"ק" is short for *שיבוץ צבאי קל* ("easy military assignment").

> **Security refactored:** Authentication is now enforced server-side via JWT Bearer tokens. The client-side AES encryption key has been removed from the bundle. Guards provide UX-level gating; the backend is the authority.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Layout](#project-layout)
- [Routing & Guards](#routing--guards)
- [State Management (NgRx)](#state-management-ngrx)
- [Services & API Layer](#services--api-layer)
- [Authentication Flow](#authentication-flow)
- [Feature Modules](#feature-modules)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Build & Deploy](#build--deploy)
- [Conventions](#conventions)

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Angular 17 (standalone components) |
| SSR | Angular SSR + Express (`server.ts`) |
| UI | Angular Material 17, custom SVG position icons |
| State | NgRx Store, Effects, Router-Store |
| Charts | `@swimlane/ngx-charts` |
| Reactive | RxJS 7 |
| Crypto (client) | `js-sha512` (SHA-512 for pre-hashing credentials) |
| Auth | JWT Bearer tokens (stored in localStorage, sent via HTTP interceptor) |
| AI assistant | Chat widget for [`ShabzakAgent`](../ShabzakAgent) (`fetch` + SSE), `marked` for markdown |
| Styling | SCSS, RTL |

## Architecture

The app follows the standard Angular + **NgRx (Redux)** unidirectional data-flow pattern. Components stay thin and dispatch actions; all side effects (HTTP) happen in effects; reducers are pure; selectors feed data back to components.

```
Component ──dispatch(Action)──▶ Effect ──▶ Service (HttpClient) ──▶ ShabzakAPI
    ▲                             │
    │                            ▼
 Selector ◀── Store/State ◀── Reducer ◀── success/failure Action
```

Feature domains each have their own actions / effects / reducer / selectors / state slice: **soldiers**, **missions**, **metadata**, and **user**. Router state is integrated via `@ngrx/router-store` with a `CustomSerializer`.

## Project Layout

```
Shabzak/
├── server.ts                       # Express SSR entry
├── angular.json / tsconfig*.json
├── Dockerfile / nginx.conf         # build → static assets served by nginx, which also proxies /api/ and /agent/
├── .dockerignore                   # keeps node_modules, dist and .angular out of the image build
├── src/
│   ├── main.ts / main.server.ts    # browser & server bootstrap
│   ├── index.html / styles.scss
│   ├── environments/               # environment.ts / .development.ts / .prod.ts
│   └── app/
│       ├── app.component.*          # root shell: Material sidenav, toolbar, icon registry
│       ├── app.config.ts            # providers: router, http, store, effects, hydration
│       ├── app.routes.ts            # route table + guards
│       ├── components/
│       │   ├── chat/                # AI assistant: launcher, panel, messages, approval cards
│       │   ├── soldiers/            # soldier CRUD, vacations, user creation
│       │   ├── missions/            # mission CRUD, instances, positions
│       │   ├── assignments/         # read-only schedule board
│       │   ├── manage-assignments/  # auto-assign (batch + interactive), replacement
│       │   ├── metadata/            # fairness charts ("justice")
│       │   └── user/                # login, personal page
│       ├── guards/                  # loggedInGuard, adminGuard, superAdminGuard
│       ├── models/                  # interfaces & enums (soldier, mission, user, ...)
│       ├── services/                # HTTP clients + snackbar + window-size; chat/ (agent client and chat state)
│       ├── state-management/        # actions / effects / reducers / selectors / states
│       └── utils/                   # aes, sha512, date utils, position translator, dialogs, SSE parser, markdown
└── assets/                          # SVG military-position icons, logo
```

## Routing & Guards

Defined in `src/app/app.routes.ts`. Default route redirects to `/login`; unknown routes also redirect to `/login`.

| Path | Component | Guard |
|---|---|---|
| `/login` | `LoginComponent` | — |
| `/personal-page` | `PersonalPageComponent` | `loggedInGuard` |
| `/soldiers` | `SoldiersContainerComponent` | `adminGuard` |
| `/missions` | `MissionsContainerComponent` | `adminGuard` |
| `/assignments` | `AssignmentsContainerComponent` | `loggedInGuard` |
| `/assignments-management` | `ManageAssignmentsContainerComponent` | `adminGuard` |
| `/justice` | `MetadataContainerComponent` | `adminGuard` |

Guards live in `src/app/guards`. They read the current user from `UserService.getLoggeduser()` and check `enabled`, `activated`, and `role` (`Regular` < `Admin` < `SuperAdmin`). `superAdminGuard` exists for the highest tier.

## State Management (NgRx)

Root state (`state-management/states/app.state.ts`):

- `router` — router-store snapshot.
- `soldiers` — `{ loading, soldiers[], vacations[], soldierSummary }`.
- `missions` — `{ loading, missions[], missionInstances[], availableSoldiers[], autoAssigning, candidateAssignments, interactiveSession, replacementCandidates, ... }`.
- `metadata` — assignment/hours/breakdown chart data.
- `user` — `{ user }`.

Actions follow the `[Source] Event` naming convention. Effects (`state-management/effects`) perform HTTP calls via services and dispatch `*Success` / `*Failure` actions; reducers apply pure updates.

## Services & API Layer

Each service wraps `HttpClient` and targets `environment.serverURL`:

- `mission.service.ts` → `api/Mission/*` (CRUD, availability, auto-assign, interactive, replacement).
- `soldier.service.ts` → `api/Soldiers/*` (CRUD, vacations, summary).
- `user.service.ts` → `api/User/*` (login, reset password, create users) + local session helpers.
- `metadata.service.ts` → `api/Metadata/*` (statistics).
- `snackbar.service.ts` — Material snackbar notifications.
- `window-size.service.ts` — responsive breakpoints.

## Authentication Flow

1. On the login page the user enters a personal number and phone.
2. `LoginComponent.onLogin()` hashes both with **SHA-512** (`utils/sha256.ts`) and dispatches `login`.
3. `UserEffects.login$` calls `UserService.login()` → `POST api/User/Login`.
4. The backend verifies the hashed credentials and returns a `LoginResponse` containing the `User` profile and a signed **JWT token**.
5. The effect stores the JWT token and user data separately in `localStorage` (plain JSON — no client-side AES), then routes to `/personal-page`.
6. On reload, `UserService.getLoggeduser()` reads the JWT, checks its `exp` claim, and rehydrates the store if still valid.
7. An **HTTP interceptor** (`interceptors/auth.interceptor.ts`) attaches `Authorization: Bearer <token>` to all outgoing API requests.
8. Route guards gate navigation on `enabled` / `activated` / `role` (SSR-safe with `isPlatformBrowser` checks).
9. The backend enforces authorization on every endpoint — guards are a UX convenience, not a security boundary.
10. The toolbar's logout button clears the token, the user, the store data and the chat conversation, and returns to `/login`.

## Feature Modules

- **Soldiers** (`/soldiers`) — searchable soldier table, add/edit dialog, vacation request/approve, bulk "create user accounts."
- **Missions** (`/missions`) — mission list, add/edit with instance scheduling and per-position requirements.
- **Assignments** (`/assignments`) — read-only timeline/board of who is assigned where.
- **Manage Assignments** (`/assignments-management`) — date-range + mission/soldier pickers; **batch auto-assign** with candidate comparison/acceptance; **interactive** step-by-step assign; **replacement** (with swap).
- **Metadata / "Justice"** (`/justice`) — assignments-per-soldier and hours-per-soldier bar charts and per-mission breakdown, filterable by soldier type (all / non-commanders / commanders / officers).
- **User** — login and a personal dashboard (upcoming missions + summary).
- **AI assistant** (every page except `/login`) — a chat button at the bottom right opens an RTL panel that talks to [`ShabzakAgent`](../ShabzakAgent): answers about the schedule, missions, soldiers, vacations and your own data stream in as they are written. Admins can ask for changes; each one shows up as an approval card (approve / reject, optional reason) and runs only after approval, and the pages reload the changed data. The conversation survives a page reload (per user, in `sessionStorage`) and is cleared on logout or "new chat".

## Getting Started

Prerequisites: **Node 20+** (`marked` requires it; the image and the verification use 22.23.4) and npm.

```bash
# from Shabzak/
npm install
npm start          # ng serve on http://localhost:5555 (opens browser)
```

The dev server expects the backend at `environment.serverURL` (`http://localhost:5165/api`): run [`ShabzakAPI`](../ShabzakAPI) with `dotnet run --launch-profile http` (the `https` profile redirects that URL to https, which the AI agent can't follow). For the assistant, also run [`ShabzakAgent`](../ShabzakAgent) (`npm run dev`, port 3001, with `CORS_ORIGINS=http://localhost:5555`). Or use the root `docker-compose.yml` to run the whole stack.

## Configuration

Environment files live in `src/environments/`:

```ts
export const environment = {
    production: false,
    serverURL: 'http://localhost:5165/api',   // backend base URL
    agentURL: 'http://localhost:3001/api'     // AI chat agent base URL
};
```

- **`environment.development.ts`** — used by `ng serve`: the API's `http` profile and the agent on port 3001.
- **`environment.ts`** — the base file (used by `ng test`), same URLs.
- **`environment.prod.ts`** — production, uses the relative `/api` and `/agent/api` paths: the container's nginx serves the app and proxies both on the same origin (see [Build & Deploy](#build--deploy)).
- The AES key has been **removed** from the environment — session management now uses JWT tokens from the backend.
- The NgRx logger meta-reducer is **gated to development only** and does not run in production builds.

## Build & Deploy

```bash
npm run build                 # ng build → dist/shabzak/browser
npm run serve:ssr:Shabzak     # run the SSR Express server (node dist/shabzak/server/server.mjs)
```

The provided `Dockerfile` builds the app on `node:22.23.4-alpine` and serves the static output with **nginx 1.30.6** (`nginx.conf`, container port 80). In the root `docker-compose.yml` the UI is published on host port **5230**, and its nginx is the single entry point of the stack:

| Path | Goes to |
|---|---|
| `/api/…` | `shabzak-api:8080` (ShabzakAPI), path unchanged; 15-minute read timeout for auto-assign |
| `/agent/…` | `shabzak-agent:3000` (the AI chat assistant) without the `/agent` prefix; no buffering (Server-Sent Events); a JSON 502 when the agent is down |
| anything else | the file, a prerendered route's `index.html`, or the app shell |

So the browser only ever talks to the UI's origin (no CORS), and the upstreams are looked up through Docker's DNS per request (nginx starts even while the API or the agent is down). `.dockerignore` keeps `node_modules`, `dist` and `.angular` out of the build context. To run the stack: `cp .env.example .env` in the workspace root, fill it in, then `docker compose up --build` (see `ShabzakAPI/README.md`).

Testing is configured with **Karma + Jasmine** (`npm test`). Most component spec files are still the generated stubs (many fail without their providers); the chat assistant's specs are real. Run only them with:

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include="src/app/services/chat/**/*.spec.ts" --include="src/app/components/chat/**/*.spec.ts" --include="src/app/utils/*.spec.ts" --include="src/app/state-management/reducers/*.spec.ts"
```

## Conventions

- **camelCase** for TypeScript; enum values kept in sync with the backend.
- **Standalone components** with explicit `imports`; providers registered in `app.config.ts`.
- **State via NgRx** — components dispatch/select rather than calling services directly (where wired up).
- **Icons** — custom SVGs registered through `MatIconRegistry` in the root component.

---

_For a detailed review of bugs, security issues, and improvements (with before/after code), see [`CODE_ANALYSIS.md`](./CODE_ANALYSIS.md). An auto-maintained deep index lives in [`AI_CONTEXT.md`](./AI_CONTEXT.md)._
