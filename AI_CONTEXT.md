# Shabzak — Frontend AI Context

> **AI Instruction:** Every time you make a change to any file in the Shabzak project, you **MUST** update this document to reflect that change — including new files, renamed files, new methods, changed architectures, new models, deleted items, etc. This file must always be accurate and up-to-date so future AI sessions can rely on it without re-analyzing the codebase. Also apply sthe same updates to the unified md document at the root folder UNIFIED_AI_CONTEXT.md

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
- **crypto-js** + **js-sha512** for client-side encryption
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
│   ├── guards/
│   │   ├── logged-in.guard.ts       # Requires authenticated user
│   │   └── admin.guard.ts           # Requires admin role
│   ├── models/                      # TypeScript interfaces/enums
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
│   ├── environment.ts               # Dev: https://localhost:7170/api
│   ├── environment.prod.ts          # Prod: same URL (should be updated for deployment)
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
| `/assignments-management` | `ManageAssignmentsContainerComponent` | `loggedInGuard` | Auto-assign, interactive assign, replacements |
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

1. User enters personalNumber + phone on login page.
2. Frontend hashes both with SHA-512 (`js-sha512`).
3. Sends to `POST api/User/Login`.
4. Backend looks up user by hashed username, verifies `SHA-512(password + salt)`.
5. On success, returns `User` object (password/salt cleared).
6. Frontend stores AES-encrypted user in `localStorage` with expiry.
7. On reload, `UserService.getLoggeduser()` checks localStorage, decrypts, validates expiry.
8. Guards check `user.enabled && user.activated`.

### 2.6 Client-Side Encryption

- **AES encryption** for localStorage user storage (using `crypto-js` with key from `environment.key`).
- **SHA-512** for credential hashing before sending to server.

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
- `AssignmentsContainerComponent` — Main container
  - Calendar/timeline view of assignments
  - Soldier assignment cards

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
- `PersonalPageComponent` — Soldier's personal view (upcoming missions, summary)

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
| `src/app/services/user.service.ts` | Auth & user API calls |
| `src/app/services/metadata.service.ts` | Statistics API calls |
| `src/app/state-management/states/app.state.ts` | Root NgRx state |
| `src/app/state-management/states/missions.state.ts` | Mission state shape |
| `src/environments/environment.ts` | API URL configuration |
