# Shabzak — Frontend AI Context

> **AI Instruction:** Every time you make a change to any file in the Shabzak project, you **MUST** update this document to reflect that change — including new files, renamed files, new methods, changed architectures, new models, deleted items, etc. This file must always be accurate and up-to-date so future AI sessions can rely on it without re-analyzing the codebase. Also apply sthe same updates to the unified md document at the root folder UNIFIED_AI_CONTEXT.md

> **Active initiative — AI Chat Assistant:** see `CHAT_AGENT_PLAN.md` in the workspace root (next to `UNIFIED_AI_CONTEXT.md`) for the phased plan, shared contracts (§4) and progress tracker. Work goes on branch `opus-refactor`; P0–P4 are committed there (also on `feature/ai-chat`, same commit), and P11–P13 in `945377c` ("Added Chat Agent"). JWT support exists only on `opus-refactor` / `feature/ai-chat`; `master` is pre-JWT and incompatible with the JWT API. P5–P10 built the **ShabzakAgent** service (separate repo next to this one, see its `AI_CONTEXT.md`): read tools, the SSE chat API (`POST /api/chat/stream|resume|reset`) with sessions and approval cards, and write tools for vacations, soldiers and login accounts (P8), missions and their shifts (P9), and the schedule (P10: auto-assign runs and proposals, assign / unassign / replace / move, replacement suggestions). The agent's auto-assign proposals are the same pending candidates as the assignments-management screen's (accepting one in either place discards the others), and `Mission/AutoAssign` now answers 409 `{ message }` while an interactive session is open (was 500). **P11–P12 (this repo) added the chat widget (§2.7):** a launcher and an RTL panel on every page except `/login`, a `fetch` + SSE client for the agent (`environment.agentURL`, dev `http://localhost:3001/api`, the same `localStorage['token']` JWT as `Authorization: Bearer`), approval cards for the agent's write actions, NgRx reloads from the `final` refresh hints, per-user `sessionStorage` history, and a toolbar **logout** (user decision). Local dev now runs the API with `dotnet run --launch-profile http`: the UI's dev `serverURL` is `http://localhost:5165/api` (user decision; the agent needs the http profile). **P13 (done, §2.8):** the UI container's `nginx.conf` now also proxies `/api/` to the API and `/agent/` to the agent (SSE-safe), so the production `serverURL` `/api` and `agentURL` `/agent/api` work on the UI's own origin with plain `docker compose up` (user decision; nothing proxied `/api` before); the prerendered routes are served without a redirect; the image builds on `node:22.23.4-alpine` (marked needs Node ≥ 20) and serves with `nginx:1.30.6-alpine` (user decision; was 1.17.1); a `.dockerignore` keeps `node_modules` out of the build context.

---

## 1. Project Overview

**Shabzak (שבצ"ק)** is a military duty-scheduling (assignment/rotation) system for an IDF (Israel Defense Forces) battalion (unit 9213). It manages soldiers, missions (guard duties, patrols, etc.), and the assignment of soldiers to mission time-slots ("instances"). The system supports both manual and automatic assignment with fairness scoring.

The workspace contains four components, all orchestrated by `docker-compose.yml` (the agent since plan Phase 13):

| Component | Tech | Container Port | Host Port |
|-----------|------|---------------|-----------|
| **Shabzak** (UI) | Angular 17, SSR, Material, NgRx | 80 (nginx: static files + the `/api/` and `/agent/` proxy) | 5230 |
| **ShabzakAPI** (Backend) | ASP.NET Core 8 Web API | 8080 | 5231 |
| **ShabzakSQL** (DB) | SQL Server (Azure SQL in prod) | 1433 | 1433 |
| **ShabzakAgent** (AI chat assistant) | Node 22, TypeScript, Express 5, LangChain v1 | 3000 | 5232; 3001 in local dev |

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
- **marked 18.1.3** (pinned exactly; GFM markdown of the chat assistant's answers, hardened renderer, §2.7)
- **RxJS** for reactive programming
- **SCSS** for styling
- **Hebrew (RTL)** locale

### 2.2 Project Structure

```
Shabzak/src/
├── app/
│   ├── app.component.ts/html/scss   # Root: Material sidenav, toolbar (+ logout button), routing, chat launcher + panel
│   ├── app.config.ts                # NgRx store, effects, router config
│   ├── app.routes.ts                # Route definitions with guards
│   ├── components/
│   │   ├── chat/                    # AI assistant widget (§2.7): chat-launcher, chat-panel, chat-message,
│   │   │                            #   chat-approval-card, chat-markdown.pipe, chat-visibility, chat-theme.scss
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
│   │   ├── chat/chat.model.ts       # Agent wire types (events, cards, decisions, errors) + chat state
│   │   ├── metadata/                # Metadata chart models
│   │   └── ...
│   ├── services/
│   │   ├── chat/                    # chat-api.service (fetch + SSE), chat-state.service, chat-storage.service,
│   │   │                            #   chat-protocol, chat-refresh, chat-decisions (§2.7)
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
│   ├── utils/                       # Utility functions (date, AES, sse-parser.ts, markdown.ts, etc.)
│   └── material/                    # Material module configuration
├── assets/                          # SVG icons (military position icons, logo)
├── environments/
│   ├── environment.ts               # Base (used by `ng test`): serverURL http://localhost:5165/api, agentURL http://localhost:3001/api
│   ├── environment.prod.ts          # Prod: serverURL '/api', agentURL '/agent/api' (same origin; the container's nginx proxies both, §2.8)
│   └── environment.development.ts   # `ng serve`: serverURL http://localhost:5165/api (API http profile), agentURL http://localhost:3001/api (still holds an unused legacy `key`)
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

**Meta-reducers** (`reducers/index.ts`): `resetOnLogout` (always; on `[User] Logout` every slice except `router` goes back to its initial state, so the previous user's data, e.g. soldiers' contact details, leaves memory) and `logger` (development only).

**Candidates:** `getAllCandidatesSuccess` stores the pending IDs (`candidatesIds`) and also drops proposals that are no longer pending from `candidatesList` and the selected `candidateAssignments` (accepting a proposal anywhere, e.g. through the chat assistant, discards all others). The assignments-management "הצג הצעות שיבוץ" dialog still lists only the proposals of this UI session's own auto-assign run (`candidatesList` is filled by `autoAssignSuccess` / the interactive run, not by `getAllCandidates`).

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
10. **Logout (P12):** the toolbar button (`.logout`, icon `logout`, title "התנתק", shown for an enabled + activated user) dispatches `userActions.logout` → the reducer clears `user`, `resetOnLogout` resets the other slices, and `UserEffects.logout$` calls `UserService.logout()` (removes `localStorage` `token` + `user` and the cached user) and navigates to `/login`. The chat assistant clears its conversation when the store user disappears, and dispatches the same action when the agent answers 401 (expired, revoked or invalid token).

### 2.5.1 Authorization Matrix (enforced by the API)

The API (not the UI) is the security boundary — see the "Authorization Matrix" in `UNIFIED_AI_CONTEXT.md` §2.4.2. What it means for the UI:
- **Regular users** may call: `User/Me`, `Mission/GetMissions` (the assigned soldiers' phone/personal number arrive **blank** since the 2026-11-16 review; the `/assignments` page shows only names and positions), `GetMissionInstances`, `GetMissionInstancesInRange`, `GetMissionsSummary`, `Schedule/GetAssignments`, `Soldiers/GetSoldiersLite`, `Soldiers/GetSoldiers` (phone/personal number arrive **blank**, and only their own soldier carries vacations), and the self-scoped `Soldiers/GetSoldierById`, `GetSummary`, `GetVacations`, `RequestVacation`, `User/ResetPassword` (403 for anyone else).
- **Everything else** (soldier/mission CRUD, assignment edits, auto-assign, candidates, replacement candidates, available soldiers, `Schedule/ValidateAssignments`, metadata, user accounts) is **Admin+** and returns 403 for Regular users. Role changes and SuperAdmin accounts are SuperAdmin-only.
- The compact agent-facing endpoints (`Schedule/*`, `GetMissionsSummary`, `GetSoldiersLite`, `GetSoldierById`) are not used by the UI yet; they use ISO local datetimes (`yyyy-MM-ddTHH:mm:ss`) instead of the `dd/MM/yyyy HH:mm` strings of `GetMissions`. The same holds for the agent-facing writes (all Admin+, `GeneralResponse` with 200/400/404/409): `Schedule/AssignSoldier`, `UnassignSoldier`, `ReplaceSoldier`, `MoveSoldier`, `Mission/CreateMission`, `UpdateMissionDetails`, `GenerateMissionInstances`, `AddMissionInstances`, `UpdateMissionInstance`, `DeleteMissionInstance`, and `Soldiers/SetSoldierActive`. The UI keeps using the legacy endpoints; its mission edit dialog calls the destructive `Mission/UpdateMission` (recreates every instance and drops their assignments).
- Disabled or deleted accounts get 401 on every call (the API re-checks the account on each request), and role changes apply immediately.
- The `/assignments` page therefore hides its editing controls for non-admins (see §3, Assignments Module).

### 2.6 Client-Side Encryption

- **No client-side AES anymore:** `utils/aes.ts` is a deprecated stub that throws if called; the AES key was removed from `environment.ts` / `environment.prod.ts` (`environment.development.ts` still holds an unused `key` value).
- **SHA-512** for credential hashing before sending to server.
- NgRx `logger` meta-reducer is enabled only when `environment.production` is false.

### 2.7 AI Chat Assistant (plan Phases 11–12)

The widget talks to **ShabzakAgent** (`environment.agentURL`; contract: plan §4.6). It is mounted in `app.component.html` after `mat-sidenav-container` as `<app-chat-panel ngSkipHydration>` and `<app-chat-launcher ngSkipHydration>`; on the server both render empty (no user), the API service returns `EMPTY` and `sessionStorage` is never touched, so SSR and the prerender of the 7 routes are unaffected.

| File | Purpose |
|------|---------|
| `components/chat/chat-launcher/` | `mat-fab` fixed bottom-right (z-index 900: above the sidenav, below Material dialogs and snackbars). Toggles the panel. Badge = number of pending approval actions; an unread dot when an answer, approval request or error arrived while closed. Hidden when there is no enabled + activated user or on `/login` (`chat-visibility.ts`), and on mobile while the panel is open |
| `components/chat/chat-panel/` | 400×600 bottom-right on desktop, full screen below 768px; `dir="rtl"`, texts `dir="auto"`. Header: "העוזר של שבצ"ק", new chat, close. Message list: `role="log"`, `aria-live="polite"`, `aria-busy` while streaming, auto-scroll unless the user scrolled up. Status line: spinner + the agent's latest Hebrew `status` label (e.g. the auto-assign heartbeat "…(עברו 30 שניות)"). Error banner: Hebrew message, the agent's detail for `forbidden` / `bad_request` / `upstream_error` / `internal`, "נסה שוב" or "שיחה חדשה". Input: `cdkTextareaAutosize` (1–5 rows), Enter sends, Shift+Enter adds a line (IME-safe), counter of the trimmed length / 2000, Send ↔ Stop while streaming, disabled while an approval is pending. Empty state: one line on the §4.11 topics (admins: "changes only after you approve") and suggestion chips per role (`CHAT_SUGGESTIONS_REGULAR` / `CHAT_SUGGESTIONS_ADMIN`). Escape inside the panel closes it; the input is focused on open |
| `components/chat/chat-message/` | Bubbles: user (plain text, `pre-wrap`; "לא נשלחה" when its request failed before reaching the agent), assistant (markdown through the `chatMarkdown` pipe into `[innerHTML]`, still sanitized by Angular; a cursor while streaming; "התשובה נקטעה" when stopped or failed), note (a divider line). Assistant bubbles sit on the start (right) side, user bubbles on the end (left) side; tables get RTL styles |
| `components/chat/chat-approval-card/` | One card set per `approval_required`: title, details, warnings (red), risk chip (סיכון נמוך / בינוני / גבוה). Per action an אשר / דחה toggle and, for דחה, an optional reason (≤ 500); "אשר הכל" / "דחה הכל" (2+ actions) set every choice; "שלח" (every action decided, not while busy) emits the decisions in order. Resolved: "אושר" / "נדחה: <reason>" / "לא בוצע" (expired). Pulses when highlighted |
| `components/chat/chat-markdown.pipe.ts`, `utils/markdown.ts` | `marked` 18.1.3 (GFM, line breaks). **Hardened renderer:** raw HTML is escaped (shown as text), images render as their alt text and links as their text, so an answer can never make the browser load or open a URL (prompt-injection / markdown-image exfiltration); task-list checkboxes → ☑/☐ |
| `components/chat/chat-visibility.ts`, `chat-theme.scss` | `isChatVisible` / `chatVisible$(store)`; palette variables (no import of the global theme) |
| `services/chat/chat-api.service.ts` | `stream(threadId, message)`, `resume(threadId, decisions)`, `reset(threadId)`. Native `fetch` (injectable `CHAT_FETCH`) with `Authorization: Bearer <UserService.getToken()>` (not `HttpClient`), the body read from the `ReadableStream` with a streaming `TextDecoder` (Hebrew split across chunks) into `SseParser`. Unsubscribe = `AbortController.abort()` (the agent stops the run). The read loop runs outside the Angular zone, events re-enter it. `EMPTY` under SSR. Non-2xx or non-SSE answers → `ChatRequestError { status, code, message, retryAfterSeconds }` (the agent's `{ code, message }`, else derived from the status); fetch / stream failures → `network` (status 0) |
| `services/chat/chat-protocol.ts` | Pure: `parseChatEvent` (SSE message → typed `ChatStreamEvent` with safe defaults; unknown events dropped; one card per action), `toApprovalAction`, `chatErrorCode`, `parseStoredChat` (validated restore) |
| `services/chat/chat-state.service.ts` | Root service; `BehaviorSubject<ChatState>` `{ open, threadId, messages, streaming, statusLabel, pendingApproval, error, unread, highlightApproval }` (behavior below) |
| `services/chat/chat-storage.service.ts` | `sessionStorage['shabzak.chat.<userId>'] = { threadId, messages }` (≤ 200 messages, ≤ 500 000 characters) |
| `services/chat/chat-refresh.ts`, `chat-decisions.ts` | Pure: refresh hints → NgRx actions; card choices → `ChatDecision[]` |
| `utils/sse-parser.ts` | Pure SSE parser (spec behavior): chunks split anywhere (also inside CRLF), LF / CR / CRLF, multi-line `data`, comments (`: ping`), BOM, default event `message`, an unterminated event at the end is dropped |
| `models/chat/chat.model.ts` | Wire and state types, `CHAT_MAX_MESSAGE_CHARS` (2000), `CHAT_MAX_REJECT_REASON_CHARS` (500), `INITIAL_CHAT_STATE` |

**`ChatStateService` behavior**
- **A turn:** `send(text)` (trimmed, 1–2000 characters, not while streaming or with a pending approval) adds the user bubble and streams. `thread` stores the thread ID, `status` sets the label, `token`s accumulate into one assistant bubble, `final` replaces it with the final markdown and applies the refresh hints, `approval_required` adds an approval message and sets `pendingApproval` (the turn ends there), `error` keeps the partial text as interrupted and shows the banner, `done` ends the turn. A stream that closes without an answer counts as `network`.
- **Approvals:** `submitDecisions(decisions)` (one per card, in order) marks the card submitted and resumes. A resume that fails before the agent starts it (network, 429, 5xx…) puts the card back to pending and "נסה שוב" resubmits it; `thread_not_found` expires the card with a note; 400 (nothing pending) or 403 expires it with a note. When an **approved** resume fails or is stopped after the agent started, everything the UI shows is reloaded (`CHAT_FALLBACK_REFRESH`), because the write may have run.
- **Errors:** Hebrew per code (`CHAT_ERROR_MESSAGES`); 429 shows the `Retry-After` seconds; "נסה שוב" for `thread_busy`, `rate_limited`, `upstream_error`, `internal`, `network` (a stream re-sends the same message without a new bubble). **401** → snackbar "פג תוקף ההתחברות. יש להתחבר מחדש." and `userActions.logout()`. **`thread_not_found`** on a new message (expired thread, agent restart) → the thread is dropped, a divider note is inserted before the message, and it is re-sent on a new thread (once). **`approval_pending`** (409) → the last approval card is shown as pending again and highlighted (or "שיחה חדשה" when there is none). `forbidden` drops the thread ID.
- **Stop** aborts the request and keeps the partial answer as interrupted. **New chat** aborts, resets the old thread (`POST /chat/reset`, best effort) and clears the storage.
- **Persistence:** saved at turn boundaries (not per token), restored when the user appears in the store (page reload): a streaming answer becomes interrupted, and only the last pending approval stays pending (when there is a thread). Cleared, with a best-effort thread reset, when the store user changes or disappears (logout, 401, another login) and on New chat; a role change of the same user keeps the visible history, but the agent no longer continues a thread created under the old role (404 `thread_not_found`), so the next message is re-sent on a new thread with the divider note. `open` and `unread` are not stored.
- **Refresh hints** (`chatRefreshActions`): `missions` → `getMissions()`; `soldiers` / `vacations` → `getSoldiers({ reloadCache: true })` (once); `vacations` also `getVacations({ soldierId })` for the user's own soldier (the personal page's list); `candidates` → `getAllCandidates()` (§2.4); `users` → nothing (the UI keeps no account list). Then the snackbar "הנתונים עודכנו".
- **Unread:** an answer, approval request or error while the panel is closed sets `unread`; opening the panel clears it.

**Tests:** 81 Karma specs — `utils/sse-parser.spec.ts`, `utils/markdown.spec.ts`, `services/chat/{chat-protocol,chat-refresh,chat-decisions,chat-api.service,chat-state.service}.spec.ts`, `components/chat/{chat-approval-card,chat-panel,chat-launcher}/*.spec.ts`, `state-management/reducers/reset-on-logout.spec.ts`. Run just them with `npx ng test --watch=false --browsers=ChromeHeadless --include="src/app/services/chat/**/*.spec.ts" --include="src/app/components/chat/**/*.spec.ts" --include="src/app/utils/*.spec.ts" --include="src/app/state-management/reducers/*.spec.ts"`; the full `ng test` also runs the generated component stubs, 34 of which fail without providers (pre-existing). Live: `ShabzakAPI/AI Plans/AI Chat Agent/verification/verify-p11-p12.ps1` drives this UI in headless Chrome (`ui-e2e.mjs`) against the agent and the dev API.

**Local dev:** API `dotnet run --launch-profile http` (http://localhost:5165), agent `npm run dev` in `ShabzakAgent/` (port 3001, `CORS_ORIGINS=http://localhost:5555`), UI `npm start` (http://localhost:5555). **Production:** the same origin serves the UI, `/api/` and `/agent/` (§2.8), so the widget's requests are same-origin and need no CORS.

### 2.8 Production build and container (plan Phase 13)

- **Build:** `npm run build` (default configuration `production`: `environment.prod.ts`, SSR prerender of the 7 routes) → `dist/shabzak/browser` (`index.html` + `<route>/index.html` per prerendered route; the SSR server in `dist/shabzak/server` is not used by the container). The bundle carries `serverURL:"/api",agentURL:"/agent/api"`.
- **`Dockerfile`:** stage 1 `node:22.23.4-alpine` (`npm ci`, `npm run build`; Node 22 because `marked` 18.1.3 requires Node ≥ 20, so the old `node:hydrogen-alpine` (Node 18, EOL) no longer fit); stage 2 `nginx:1.30.6-alpine` (current stable; was 1.17.1 from 2019) with `nginx.conf` and the browser build. Both pinned (user decision).
- **`.dockerignore`** (new): `node_modules/`, `dist/`, `.angular/`, `coverage/`, `.git/`, editor folders, `.env*`, logs. Without it `COPY . .` copied a dev checkout's `node_modules` (e.g. Windows binaries of esbuild) over the container's.
- **`nginx.conf`** (one origin for the browser; user decision):
  - `location /` → `try_files $uri $uri/index.html /index.html`: files, then a prerendered route's page (no 301 to `/login/`, which the old `$uri/` caused), then the app shell. `absolute_redirect off`, so a redirect can never name the container's port 80 instead of the published 5230.
  - `location /api/` → `http://shabzak-api:8080` (path unchanged), `proxy_read_timeout 900s` (`Mission/AutoAssign` answers when its run ends), `client_max_body_size 30m` (Kestrel's limit).
  - `location /agent/` → `http://shabzak-agent:3000` with `/agent` stripped, `proxy_buffering off` (SSE), `proxy_read_timeout 300s` (the agent pings every 15 s), and `error_page 502 503 504` → `@agent_unavailable`: `502 {"code":"upstream_error","message":"The Shabzak assistant service is not reachable."}`, shown by the widget as "שירות העוזר לא זמין כרגע" + the detail, with "נסה שוב".
  - `resolver 127.0.0.11 valid=10s ipv6=off` + `set $upstream` variables: Docker's DNS is asked per request, so nginx starts while the API or the agent is down and follows a container recreated with a new address.
- The browser's API and agent calls are same-origin, so neither the API's nor the agent's CORS settings matter for the containerized UI. The agent's `X-Accel-Buffering: no` also keeps any nginx-based proxy in front from buffering the stream.
- **Verified without Docker** (not installed on the dev machine): `ShabzakAPI/AI Plans/AI Chat Agent/verification/verify-p13.ps1` serves this build behind this exact `nginx.conf` on nginx 1.30.6 for Windows (only the Docker host names, port and paths replaced) and runs the P11–P12 browser phases, real logins and the gateway failure modes through it.

---

## 3. Component Hierarchy

### Soldiers Module (`/soldiers`)
- `SoldiersContainerComponent` — Main container
  - Soldier list (table with search/filter)
  - Add/Edit soldier dialog
  - Delete (confirmation dialog → `Soldiers/DeleteSoldier`). The API also deletes the soldier's login account. When the user may not delete that account (a SuperAdmin's account for an Admin, or their own), the API refuses with 403 / 400 / 409 and nothing is deleted. The effect then shows the generic "שגיאה בהסרת חייל" snackbar and keeps the soldier in the store.
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

### Chat Assistant (every page except `/login`, §2.7)
- `ChatLauncherComponent` — floating button bottom-right (badge for a pending approval, unread dot)
- `ChatPanelComponent` — the RTL panel (header, messages, status line, error banner, input)
  - `ChatMessageComponent` — user / assistant (markdown) / note bubbles
  - `ChatApprovalCardComponent` — approve / reject cards for the agent's write actions

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

**Chat path (§2.7):** chat panel → `ChatApiService` (`fetch`, Bearer JWT) → ShabzakAgent `POST /api/chat/stream|resume` → SSE events → `ChatStateService` → panel. The agent calls the API with the same JWT; after an approved write its `final.refresh` hints make the UI dispatch the existing NgRx reloads.

---

## 5. Conventions & Patterns

- **Naming:** Frontend uses camelCase (TypeScript convention). Enum values match between front/back.
- **State Management:** NgRx actions follow `[Source] Event Name` pattern. Effects handle side effects (API calls). Reducers are pure. The chat assistant keeps its own state in `ChatStateService` (a `BehaviorSubject`, not NgRx) and only dispatches the existing reload actions.
- **Icons:** Custom SVG icons for each military position, registered via `MatIconRegistry`.
- **Untrusted HTML:** never bind agent or user text with `bypassSecurityTrust*`; assistant markdown goes through `renderChatMarkdown` (escapes raw HTML, no images or links) and Angular's `[innerHTML]` sanitizer.

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
| `src/app/state-management/reducers/index.ts` | Root reducers, `resetOnLogout` + dev `logger` meta-reducers |
| `src/environments/environment*.ts` | `serverURL` (API) and `agentURL` (chat agent) per build |
| `Dockerfile` / `nginx.conf` / `.dockerignore` | Production image: Node 22 build stage, nginx 1.30.6 serving the build and proxying `/api/` and `/agent/` (§2.8) |
| `src/app/services/chat/chat-state.service.ts` | Chat assistant state: turns, approvals, errors, persistence, refresh hints |
| `src/app/services/chat/chat-api.service.ts` | `fetch` + SSE client of the agent (`stream`, `resume`, `reset`) |
| `src/app/utils/sse-parser.ts` / `src/app/utils/markdown.ts` | Pure SSE parser / hardened markdown renderer |
| `src/app/components/chat/` | Launcher, panel, message bubbles, approval cards |
