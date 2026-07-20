# Shabzak — Frontend (Angular)

> Angular 17 single-page app (with SSR) for **Shabzak (שבצ"ק)** — a military duty-scheduling system that assigns soldiers to mission time-slots. This is the UI for the [`ShabzakAPI`](../ShabzakAPI) backend.

The interface is **Hebrew / RTL**. "שבצ"ק" is short for *שיבוץ צבאי קל* ("easy military assignment").

> **Security notice:** authentication and role checks are currently enforced only in the browser, and an encryption key is shipped in the client bundle. See [`CODE_ANALYSIS.md`](./CODE_ANALYSIS.md) before relying on them.

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
| Crypto (client) | `crypto-js` (AES), `js-sha512` (SHA-512) |
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
├── Dockerfile / nginx.conf         # build → static assets served by nginx
├── src/
│   ├── main.ts / main.server.ts    # browser & server bootstrap
│   ├── index.html / styles.scss
│   ├── environments/               # environment.ts / .development.ts / .prod.ts
│   └── app/
│       ├── app.component.*          # root shell: Material sidenav, toolbar, icon registry
│       ├── app.config.ts            # providers: router, http, store, effects, hydration
│       ├── app.routes.ts            # route table + guards
│       ├── components/
│       │   ├── soldiers/            # soldier CRUD, vacations, user creation
│       │   ├── missions/            # mission CRUD, instances, positions
│       │   ├── assignments/         # read-only schedule board
│       │   ├── manage-assignments/  # auto-assign (batch + interactive), replacement
│       │   ├── metadata/            # fairness charts ("justice")
│       │   └── user/                # login, personal page
│       ├── guards/                  # loggedInGuard, adminGuard, superAdminGuard
│       ├── models/                  # interfaces & enums (soldier, mission, user, ...)
│       ├── services/                # HTTP clients + snackbar + window-size
│       ├── state-management/        # actions / effects / reducers / selectors / states
│       └── utils/                   # aes, sha512, date utils, position translator, dialogs
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
4. The backend verifies the hashed credentials and returns the `User` (with linked soldier + upcoming missions).
5. The effect stores the user in memory and in `localStorage` as an **AES-encrypted** blob with a 7-day `valid` expiry (`utils/aes.ts`), then routes to `/personal-page`.
6. On reload, `UserService.getLoggeduser()` decrypts the blob, checks expiry, and rehydrates the store.
7. Route guards gate navigation on `enabled` / `activated` / `role`.

## Feature Modules

- **Soldiers** (`/soldiers`) — searchable soldier table, add/edit dialog, vacation request/approve, bulk "create user accounts."
- **Missions** (`/missions`) — mission list, add/edit with instance scheduling and per-position requirements.
- **Assignments** (`/assignments`) — read-only timeline/board of who is assigned where.
- **Manage Assignments** (`/assignments-management`) — date-range + mission/soldier pickers; **batch auto-assign** with candidate comparison/acceptance; **interactive** step-by-step assign; **replacement** (with swap).
- **Metadata / "Justice"** (`/justice`) — assignments-per-soldier and hours-per-soldier bar charts and per-mission breakdown, filterable by soldier type (all / non-commanders / commanders / officers).
- **User** — login and a personal dashboard (upcoming missions + summary).

## Getting Started

Prerequisites: **Node 18+** and npm.

```bash
# from Shabzak/
npm install
npm start          # ng serve on http://localhost:5555 (opens browser)
```

The dev server expects the backend at `environment.serverURL` (default `https://localhost:7170/api`). Run [`ShabzakAPI`](../ShabzakAPI) first, or use the root `docker-compose.yml` to run the whole stack.

## Configuration

Environment files live in `src/environments/`:

```ts
export const environment = {
    production: false,
    serverURL: 'https://localhost:7170/api',   // backend base URL
    key: 'b4815f36-bab2-4542-bdca-4c276880b045' // AES key for localStorage (see analysis)
};
```

> `environment.prod.ts` currently also points at `localhost` — update `serverURL` for real deployments. The `key` is used to encrypt the cached user; note it ships inside the browser bundle.

## Build & Deploy

```bash
npm run build                 # ng build → dist/shabzak
npm run serve:ssr:Shabzak     # run the SSR Express server (node dist/shabzak/server/server.mjs)
```

The provided `Dockerfile` builds the app and serves the static output with **nginx** (`nginx.conf`, container port 80). In the root `docker-compose.yml` the UI is published on host port **5230**.

Testing is configured with **Karma + Jasmine** (`npm test`); most spec files are still the generated stubs.

## Conventions

- **camelCase** for TypeScript; enum values kept in sync with the backend.
- **Standalone components** with explicit `imports`; providers registered in `app.config.ts`.
- **State via NgRx** — components dispatch/select rather than calling services directly (where wired up).
- **Icons** — custom SVGs registered through `MatIconRegistry` in the root component.

---

_For a detailed review of bugs, security issues, and improvements (with before/after code), see [`CODE_ANALYSIS.md`](./CODE_ANALYSIS.md). An auto-maintained deep index lives in [`AI_CONTEXT.md`](./AI_CONTEXT.md)._
