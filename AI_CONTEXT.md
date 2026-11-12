# Shabzak — Frontend AI Context

> **AI Instruction:** Every time you make a change to any file in the Shabzak project, you **MUST** update this document to reflect that change — including new files, renamed files, new methods, changed architectures, new models, deleted items, etc. This file must always be accurate and up-to-date so future AI sessions can rely on it without re-analyzing the codebase. Also apply sthe same updates to the unified md document at the root folder UNIFIED_AI_CONTEXT.md

> **Active initiative — AI Chat Assistant:** see `CHAT_AGENT_PLAN.md` in the workspace root (next to `UNIFIED_AI_CONTEXT.md`) for the phased plan, shared contracts (§4) and progress tracker. Work happens on branch `feature/ai-chat` (from `opus-refactor`); P0–P4 are committed and merged into `opus-refactor` (both branches point at the same commit). JWT support exists only on `opus-refactor` / `feature/ai-chat`; `master` is pre-JWT and incompatible with the JWT API.

---

## 1. Project Overview

**Shabzak (שבצ"ק)** is a military duty-scheduling (assignment/rotation) system for an IDF (Israel Defense Forces) battalion (unit 9213). It manages soldiers, missions (guard duties, patrols, etc.), and the assignment of soldiers to mission time-slots ("instances"). The system supports both manual and automatic assignment with fairness scoring.

The monorepo contains three components orchestrated by `docker-compose.yml`:

| Component | Tech | Container Port | Host Port |
|-----------|------|---------------|-----------|
| **Shabzak** (UI) | Angular 17, SSR, Material, NgRx | 80 (nginx) | 5230 |
| **ShabzakAPI** (Backend) | ASP.NET Core 8 Web API | 8080 | 5231 |
| **ShabzakSQL** (DB) | SQL Server (Azure SQL in prod) | 1433 | 1433 |

**Language/locale:** Hebrew (RTL UI). The app title is שבצ"ק (short for שיבוץ צבאי קל — "easy military assignment").

---

## 2. Shabzak — Frontend (Angular)

### 2.1 Tech Stack

- **Angular 17** with standalone components and SSR support
- **Angular Material 17** for UI components
- **NgRx** (Store, Effects, Router-Store) for state management
- **ngx-charts** for data visualization (metadata/charts)
- **js-sha512** for credential hashing (crypto-js is still a dependency but client-side AES is no longer used)
- **JWT Bearer** auth via an HTTP interceptor
- **RxJS** for reactive programming
- **SCSS** for styling
- **Hebrew (RTL)** locale

### 2.2 Project Structure

```
Shabzak/src/
├── app/
│   ├── app.component.ts/html/scss   # Root: Material sidenav, toolbar, routing
│   ├── app.config.ts                # NgRx store, effects, router config
│   ├── app.routes.ts                # Route definitions with guards
│   ├── components/
│   │   ├── assignments/             # Assignment board (view assigned schedules)
│   │   ├── manage-assignments/      # Auto-assign UI, interactive assign, replacement
│   │   ├── missions/                # Mission CRUD, instance management
│   │   ├── soldiers/                # Soldier CRUD, vacation management
│   │   ├── metadata/                # Statistics: charts, tables, breakdowns
│   │   └── user/                    # Login, personal page
│   ├── guards/                      # UX-only gating (SSR-safe: return false on the server)
│   │   ├── logged-in.guard.ts       # Requires enabled + activated user
│   │   ├── admin.guard.ts           # Requires role > Regular
│   │   └── super-admin.guard.ts     # Requires role SuperAdmin (not used by routes yet)
│   ├── interceptors/
│   │   └── auth.interceptor.ts      # Adds Authorization: Bearer <localStorage.token> to every HttpClient request
│   ├── models/                      # TypeScript interfaces/enums
│   │   ├── login-response.model.ts  # { user: User, token: string }
│   │   ├── soldier.model.ts
│   │   ├── mission.model.ts
│   │   ├── mission-instance.model.ts
│   │   ├── mission-position.model.ts
│   │   ├── soldier-mission.model.ts
│   │   ├── position.enum.ts
│   │   ├── user.model.ts
│   │   ├── user-role.enum.ts
│   │   ├── vacation.model.ts
│   │   ├── auto-assign/             # Auto-assign specific models
│   │   ├── metadata/                # Metadata chart models
│   │   └── ...
│   ├── services/
│   │   ├── mission.service.ts       # HTTP calls to MissionController
│   │   ├── soldier.service.ts       # HTTP calls to SoldiersController
│   │   ├── user.service.ts          # HTTP calls to UserController + local auth
│   │   ├── metadata.service.ts      # HTTP calls to MetadataController
│   │   ├── snackbar.service.ts      # Material snackbar notifications
│   │   └── window-size.service.ts   # Responsive window tracking
│   ├── state-management/
│   │   ├── actions/
│   │   │   ├── soldiers.actions.ts
│   │   │   ├── missions.actions.ts
│   │   │   ├── metadata.actions.ts
│   │   │   └── user.actions.ts
│   │   ├── effects/
│   │   │   ├── soldiers.effects.ts
│   │   │   ├── missions.effects.ts
│   │   │   ├── metadata.effects.ts
│   │   │   └── user.effects.ts
│   │   ├── reducers/
│   │   ├── selectors/
│   │   ├── states/
│   │   │   ├── app.state.ts         # Root state: router, soldiers, missions, metadata, user
│   │   │   ├── soldiers.state.ts
│   │   │   ├── missions.state.ts
│   │   │   ├── metadata.state.ts
│   │   │   └── user.state.ts
│   │   └── custom-router-serializer.ts
│   ├── utils/                       # Utility functions (date, AES, etc.)
│   └── material/                    # Material module configuration
├── assets/                          # SVG icons (military position icons, logo)
├── environments/
│   ├── environment.ts               # Dev: serverURL https://localhost:7170/api (no AES key anymore)
│   ├── environment.prod.ts          # Prod: serverURL '/api' (reverse-proxied)
│   └── environment.development.ts
├── styles.scss                      # Global styles
└── index.html
```

### 2.3 Routes & Navigation

| Path | Component | Guard | Description |
|------|-----------|-------|-------------|
| `/login` | `LoginComponent` | None | Login page (default) |
| `/personal-page` | `PersonalPageComponent` | `loggedInGuard` | Soldier's personal dashboard |
| `/soldiers` | `SoldiersContainerComponent` | `adminGuard` | Soldier management (CRUD) |
| `/missions` | `MissionsContainerComponent` | `adminGuard` | Mission management (CRUD) |
| `/assignments` | `AssignmentsContainerComponent` | `loggedInGuard` | View assignment schedule |
| `/assignments-management` | `ManageAssignmentsContainerComponent` | `adminGuard` | Auto-assign, interactive assign, replacements |
| `/justice` | `MetadataContainerComponent` | `adminGuard` | Fairness statistics & charts |

### 2.4 NgRx State Management

**Root State (`AppState`):**
- `router` — NgRx Router Store
- `soldiers` — `SoldiersState { loading, soldiers[], vacations[], soldierSummary }`
- `missions` — `MissionsState { loading, missions[], missionInstances[], availableSoldiers[], autoAssigning, candidateAssignments, interactiveSession, replacementCandidates, ... }`
- `metadata` — `MetadataState { assignmentsPerSoldier, hoursPerSoldier, assignmentsBreakdown, ... }`
- `user` — `UsersState { user }`

**Flow:** Component dispatches Action → Effect calls Service → Service makes HTTP request → Effect dispatches success/failure Action → Reducer updates State → Selector provides data to Component.

### 2.5 Authentication Flow

1. User enters personalNumber + phone on the login page.
2. Frontend hashes both with SHA-512 (`js-sha512`, `utils/sha256.ts → encryptSHA`).
3. `UserEffects.login$` sends them to `POST api/User/Login` (anonymous).
4. Backend looks up the user by hashed username and verifies the password (PBKDF2, or legacy SHA-512 + salt with transparent upgrade).
5. On success it returns `GeneralResponse<LoginResponse>` = `{ user, token }` (password/salt blanked; `token` is a signed JWT).
6. The effect stores `localStorage['token']` (raw JWT) and `localStorage['user']` (plain JSON), calls `UserService.setLoggeduser`, and navigates to `/personal-page`.
7. `interceptors/auth.interceptor.ts` (registered via `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`) adds `Authorization: Bearer <token>` to every HttpClient request. `UserService.getToken()` returns the token (null under SSR).
8. On reload, `UserService.getLoggeduser()` reads token + user from localStorage, decodes the JWT `exp`, clears both if expired/corrupt, otherwise dispatches `loginSuccess`.
9. Guards (SSR-safe) check `user.enabled && user.activated` (+ role for `adminGuard`/`superAdminGuard`). They are UX only — the API is the security boundary.
10. There is currently no logout action in the UI (stored token/user remain until JWT expiry).

### 2.5.1 Authorization Matrix (enforced by the API)

The API (not the UI) is the security boundary — see the "Authorization Matrix" in `UNIFIED_AI_CONTEXT.md` §2.4.2. What it means for the UI:
- **Regular users** may call: `User/Me`, `Mission/GetMissions`, `GetMissionInstances`, `GetMissionInstancesInRange`, `GetMissionsSummary`, `Schedule/GetAssignments`, `Soldiers/GetSoldiersLite`, `Soldiers/GetSoldiers` (phone/personal number arrive **blank**, and only their own soldier carries vacations), and the self-scoped `Soldiers/GetSoldierById`, `GetSummary`, `GetVacations`, `RequestVacation`, `User/ResetPassword` (403 for anyone else).
- **Everything else** (soldier/mission CRUD, assignment edits, auto-assign, candidates, replacement candidates, available soldiers, `Schedule/ValidateAssignments`, metadata, user accounts) is **Admin+** and returns 403 for Regular users. Role changes and SuperAdmin accounts are SuperAdmin-only.
- The compact agent-facing endpoints (`Schedule/*`, `GetMissionsSummary`, `GetSoldiersLite`, `GetSoldierById`) are not used by the UI yet; they use ISO local datetimes (`yyyy-MM-ddTHH:mm:ss`) instead of the `dd/MM/yyyy HH:mm` strings of `GetMissions`. The same holds for the agent-facing writes (all Admin+, `GeneralResponse` with 200/400/404/409): `Schedule/AssignSoldier`, `UnassignSoldier`, `ReplaceSoldier`, `MoveSoldier`, `Mission/CreateMission`, `UpdateMissionDetails`, `GenerateMissionInstances`, `AddMissionInstances`, `UpdateMissionInstance`, `DeleteMissionInstance`, and `Soldiers/SetSoldierActive`. The UI keeps using the legacy endpoints; its mission edit dialog calls the destructive `Mission/UpdateMission` (recreates every instance and drops their assignments).
- Disabled or deleted accounts get 401 on every call (the API re-checks the account on each request), and role changes apply immediately.
- The `/assignments` page therefore hides its editing controls for non-admins (see §3, Assignments Module).

### 2.6 Client-Side Encryption

- **No client-side AES anymore:** `utils/aes.ts` is a deprecated stub that throws if called; the AES key was removed from the environments.
- **SHA-512** for credential hashing before sending to server.
- NgRx `logger` meta-reducer is enabled only when `environment.production` is false.

---

## 3. Component Hierarchy

### Soldiers Module (`/soldiers`)
- `SoldiersContainerComponent` — Main container
  - Soldier list (table with search/filter)
  - Add/Edit soldier dialog
  - Vacation management (request, approve/deny)
  - Create user accounts for soldiers

### Missions Module (`/missions`)
- `MissionsContainerComponent` — Main container
  - Mission list
  - Add/Edit mission dialog (with instance schedule configuration)
  - Mission positions configuration
  - Mission instances timeline

### Assignments Module (`/assignments`)
- `AssignmentsContainerComponent` — Main container (also embedded in `/assignments-management` with `[canEdit]="true"`)
  - Calendar/timeline view of assignments
  - Soldier assignment cards
  - `AssignmentsByDayComponent` — editing controls (the `+` add trigger and the "הוסף חייל" / "הסר חייל" / "החלף חייל" menu items, which open `ManuallyAssignContainerComponent` / `ReplaceSoldierDialogComponent`) are rendered only when `isAdmin` (`selectUser` role ≥ `UserRole.Admin`); the handlers also no-op for non-admins. Regular users see the schedule read-only (menu keeps only "הצג פרטי משימה").
  - "הסר חייל" calls `Mission/RemoveSoldierFromMissionInstance`, which failed with 500 on every call until the API fix in P3 (missing `Mission.MissionPositions` include).

### Manage Assignments Module (`/assignments-management`)
- `ManageAssignmentsContainerComponent` — Main container
  - Date range picker for auto-assign
  - Mission/soldier selection for auto-assign
  - Auto-assign trigger (batch mode)
  - Interactive auto-assign step-by-step UI
  - Candidate comparison and acceptance
  - Replacement soldier UI (with swap support)

### Metadata Module (`/justice`)
- `MetadataContainerComponent` — Main container
  - Assignments-per-soldier bar chart
  - Hours-per-soldier bar chart
  - Assignment breakdown per mission per soldier
  - Filter by soldier type (All, Non-Commanders, Commanders, Officers)

### User Module
- `LoginComponent` — Login form
- `PersonalPageComponent` — Soldier's personal view (summary, change password, vacation request, own vacations). Calls only self-scoped endpoints (`GetSummary`, `GetVacations`, `RequestVacation`, `ResetPassword`).
  - `ResetPasswordComponent` emits `{ username, password, usernameHashed }`: the username is pre-filled from the logged-in user (already the SHA-512 hash, so `usernameHashed=true` and it is not hashed again) and the password comes from `passwordControl`. `PersonalPageComponent.onResetPassword` hashes the password (and the username only when typed manually).

---

## 4. Data Flow Summary

```
[ Angular UI ]
    ↓ HTTP (JSON)
[ ASP.NET Core Controllers ]
    ↓ ViewModels → BL Models
[ BL Services ]
    ↓ BL Models → DB Models (via Translators)
    ↓ Encrypt PII (AESEncryptor)
[ DataLayer (EF Core) ]
    ↓ SQL
[ SQL Server / Azure SQL ]
```

**Read path:** DB → Decrypt → Translate to BL model → Controller returns JSON → Angular stores in NgRx → Component renders.

**Write path:** Angular sends DTO → Controller receives → Translate to DB model → Encrypt PII → EF Core saves → Reload cache async.

---

## 5. Conventions & Patterns

- **Naming:** Frontend uses camelCase (TypeScript convention). Enum values match between front/back.
- **State Management:** NgRx actions follow `[Source] Event Name` pattern. Effects handle side effects (API calls). Reducers are pure.
- **Icons:** Custom SVG icons for each military position, registered via `MatIconRegistry`.

---

## 6. File Reference Quick-Lookup

### Most Important Files
| File | Purpose |
|------|---------|
| `src/app/app.routes.ts` | Route configuration |
| `src/app/app.config.ts` | NgRx and provider setup |
| `src/app/app.component.ts` | Root component, sidenav, icons |
| `src/app/services/mission.service.ts` | Mission API calls |
| `src/app/services/soldier.service.ts` | Soldier API calls |
| `src/app/services/user.service.ts` | Auth & user API calls, `getToken()`, session rehydration |
| `src/app/interceptors/auth.interceptor.ts` | Attaches the JWT Bearer header |
| `src/app/guards/*.guard.ts` | `loggedInGuard`, `adminGuard`, `superAdminGuard` |
| `src/app/services/metadata.service.ts` | Statistics API calls |
| `src/app/state-management/states/app.state.ts` | Root NgRx state |
| `src/app/state-management/states/missions.state.ts` | Mission state shape |
| `src/environments/environment.ts` | API URL configuration |
