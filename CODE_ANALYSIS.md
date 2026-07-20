# Shabzak (Frontend) — Code Analysis & Review

A prioritized review of bugs, security vulnerabilities, and improvement opportunities in the Angular frontend. **No code was changed** — every "After" snippet is a *recommendation*.

Several items here are two sides of the same coin as the backend: the frontend currently acts as the *only* access-control layer, which is not a security boundary. Cross-references to [`../ShabzakAPI/CODE_ANALYSIS.md`](../ShabzakAPI/CODE_ANALYSIS.md) are noted where relevant.

## Severity legend

| Level | Meaning |
|---|---|
| 🔴 Critical | Data exposure / auth bypass |
| 🟠 High | Serious weakness or broken production behavior |
| 🟡 Medium | Correctness / SSR / maintainability bug |
| ⚪ Low | Code quality, tooling, minor performance |

## Findings at a glance

| # | Severity | Area | Finding |
|---|---|---|---|
| 1 | 🔴 | AuthZ | Authentication & role checks are enforced only in the browser (bypassable) |
| 2 | 🔴 | Secrets | AES key is committed and shipped in the client bundle |
| 3 | 🟠 | Data leak | NgRx `logger` meta-reducer logs full state (incl. user PII) in production |
| 4 | 🟠 | Config | `environment.prod.ts` points the API at `localhost` |
| 5 | 🟠 | Session | User session in `localStorage` with client-trusted role/enabled flags |
| 6 | 🟡 | Deploy | Docker/nginx serves the wrong build output path |
| 7 | 🟡 | SSR | `localStorage` accessed without a platform check |
| 8 | 🟡 | Robustness | No HTTP interceptor: no 401 handling, repeated per-effect error code |
| 9 | ⚪ | Cleanup | Leftover `console.log`/`console.error` debug statements |
| 10 | ⚪ | Tooling | Production bundle budgets effectively disabled (100 MB) |
| 11 | ⚪ | Docker | `npm install` (not `ci`) + very old `nginx:1.17.1` base image |
| 12 | ⚪ | Tests | Only generated spec stubs; no real coverage |

---

## 🔴 1. Authentication and authorization exist only in the browser

**Where:** `src/app/guards/*.ts`, `src/app/services/user.service.ts`.

Route guards decide access by reading a user object out of `localStorage` and checking flags:

**Before** (`admin.guard.ts`):
```ts
export function adminGuard(): CanActivateFn {
  return () => {
    const user = inject(UserService).getLoggeduser();
    if (user?.enabled && user?.activated && user?.role > UserRole.Regular) {
      return true;
    }
    inject(Router).navigateByUrl('login');
    return false;
  };
}
```

The `user` object (including `role`, `enabled`, `activated`) comes from client storage and is decrypted with a key that is also in the bundle (finding #2). A user can craft an "admin" object, re-encrypt it, drop it into `localStorage`, and pass every guard. Worse, because the backend has **no authorization at all** (see backend finding #1), an attacker doesn't even need the UI — they can call the API directly.

**After** — keep guards for UX, but make the server the source of truth:
```ts
// guards stay, but authorization is really enforced server-side via a signed token.
// Attach the token to every request with an interceptor:
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenService).accessToken;   // from a server-issued JWT
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
// register: provideHttpClient(withFetch(), withInterceptors([authInterceptor]))
```
The server validates the JWT (and the role claim) on every protected endpoint; the guard's role check becomes a convenience, not the boundary.

**Why:** Anything shipped to the browser is fully under the user's control. Authorization must be verified on the server.

---

## 🔴 2. AES key is committed and shipped to the client

**Where:** `src/environments/environment*.ts`, `src/app/utils/aes.ts`.

**Before:**
```ts
// environment.ts / environment.development.ts / environment.prod.ts (identical)
export const environment = {
  production: false,
  serverURL: 'https://localhost:7170/api',
  key: 'b4815f36-bab2-4542-bdca-4c276880b045'   // used to encrypt the cached user
};
```
```ts
// aes.ts
const key = environment.key;
export const encryptAES = (m: string) => CryptoJS.AES.encrypt(m.trim(), key).toString();
export const decryptAES = (m: string) => CryptoJS.AES.decrypt(m.trim(), key).toString(CryptoJS.enc.Utf8);
```

The key is in source control and in every user's downloaded JavaScript, so the `localStorage` "encryption" is only obfuscation: anyone can decrypt the stored user or forge a new one (see #1).

**After:**
- Don't hold secrets in the SPA. Represent the session as an **opaque, server-signed token** (JWT) that the client cannot forge, ideally stored in an `HttpOnly` cookie so JavaScript (and XSS) can't read it.
- If a client-side cache is kept, store only non-sensitive display fields and never trust security flags from it.

**Why:** A key embedded in client code provides no confidentiality or integrity against the client.

---

## 🟠 3. NgRx `logger` meta-reducer runs in production

**Where:** `src/app/state-management/reducers/index.ts` (wired in `app.config.ts` via `metaReducers`).

**Before:**
```ts
export function logger(reducer: ActionReducer<any>): ActionReducer<any> {
  return function (state, action) {
    console.group(action.type);
    console.log('%c prev state', '...', state);   // entire app state, incl. logged-in user + soldier PII
    const nextState = reducer(state, action);
    console.log('%c next state', '...', nextState);
    console.groupEnd();
    return nextState;
  };
}
export const metaReducers = [logger];
```
On every dispatched action this prints the whole state tree — including the authenticated user and any loaded soldier data — to the browser console (and it runs in production because it is unconditionally included).

**After:**
```ts
import { isDevMode } from '@angular/core';
export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [logger] : [];
```

**Why:** Verbose state logging leaks PII into the console/adds noise and is a performance cost; it should be development-only.

---

## 🟠 4. Production environment points at `localhost`

**Where:** `src/environments/environment.prod.ts`.

**Before:**
```ts
export const environment = {
  production: true,
  serverURL: 'https://localhost:7170/api',   // unreachable from users' browsers
  key: '...'
};
```
The production build (via `angular.json` `fileReplacements`) swaps in this file, so a deployed UI tries to call the API on the *user's own machine*.

**After:**
```ts
export const environment = {
  production: true,
  serverURL: 'https://api.shabzak.example/api',   // real, per-environment base URL
};
```
Better: source the base URL from runtime config (an `APP_INITIALIZER` fetching `/config.json`) so the same build can target multiple environments.

**Why:** As shipped, the production frontend cannot reach the backend.

---

## 🟠 5. Session stored in `localStorage` with client-trusted flags

**Where:** `src/app/state-management/effects/user.effects.ts`, `user.service.ts`.

**Before:**
```ts
const json = JSON.stringify({ ...res.value, valid: addDays(new Date(), 7) });
localStorage.setItem('user', encryptAES(json));   // role/enabled/activated live here for 7 days
```
```ts
getLoggeduser() {
  const usr = localStorage?.getItem('user');
  if (usr) {
    const user = JSON.parse(decryptAES(usr));
    user.valid = new Date(user.valid);
    if (user.valid.getTime() < Date.now()) localStorage?.removeItem('user');
    else { this.store.dispatch(userActions.loginSuccess({ user })); this.loggedUser = user; }
  }
  return this.loggedUser;
}
```
Problems: (a) `localStorage` is readable by any script, so an XSS bug exfiltrates the session; (b) the security-relevant fields (`role`, `enabled`, `activated`) are trusted from storage; (c) expiry is enforced client-side only.

**After:** prefer a short-lived server token in an `HttpOnly`, `Secure`, `SameSite` cookie; keep only cosmetic profile data in memory. Re-fetch the user profile from a `GET /me` endpoint on load rather than trusting stored flags.

**Why:** Client storage is not a safe place for a trusted session; the server must re-authorize each request.

---

## 🟡 6. Docker/nginx serves the wrong build output directory

**Where:** `Dockerfile`, `nginx.conf`, `angular.json`.

`angular.json` uses the `@angular-devkit/build-angular:application` builder with `outputPath: dist/shabzak` and SSR/prerender enabled. That builder emits **`dist/shabzak/browser/`** (and `dist/shabzak/server/`), so `index.html` is under `browser/`, not at the root.

**Before** (`Dockerfile`):
```dockerfile
COPY --from=build /usr/src/app/dist/shabzak /usr/share/nginx/html
```
nginx then has `browser/` and `server/` folders under its root and cannot find `index.html` (its `try_files ... /index.html` 404s).

**After:**
```dockerfile
COPY --from=build /usr/src/app/dist/shabzak/browser /usr/share/nginx/html
```

**Why:** The static site won't serve with the current copy path. (Also note: SSR is built but nginx ignores it — decide whether you actually want SSR, and if so serve via the Node `server.ts` instead of nginx.)

---

## 🟡 7. `localStorage` accessed without a platform check (not SSR-safe)

**Where:** `user.service.ts`, `user.effects.ts`.

This app enables SSR (`server.ts`, `provideClientHydration()`), but `localStorage` only exists in the browser. Guards call `getLoggeduser()` during route activation, which can execute on the server during SSR/prerender.

**Before:**
```ts
localStorage.setItem('user', userJson);         // effects
const usr = localStorage?.getItem('user');       // service
```
Optional chaining doesn't help here — referencing the undeclared `localStorage` global on the server throws `ReferenceError` before `?.` applies.

**After:**
```ts
constructor(@Inject(PLATFORM_ID) private platformId: object) {}
private get storage(): Storage | null {
  return isPlatformBrowser(this.platformId) ? localStorage : null;
}
// usage: this.storage?.getItem('user');
```

**Why:** Guarding browser-only APIs keeps SSR/prerender from crashing and makes the code portable.

---

## 🟡 8. No HTTP interceptor: no central 401 handling, duplicated error code

**Where:** `app.config.ts` (`provideHttpClient(withFetch())`), every effect's `catchError`.

Each effect repeats the same `catchError(err => { console.error(err); snackbar(...); return of(failure()); })`. There is no interceptor to attach auth headers (needed once the backend enforces auth — see #1), handle `401/403` by redirecting to login, or centralize error toasts.

**After** — add interceptors and a shared error helper:
```ts
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(catchError(err => {
    if (err.status === 401) inject(Router).navigateByUrl('login');
    return throwError(() => err);
  }));
// provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor]))
```

**Why:** Central cross-cutting handling reduces duplication and makes auth/error behavior consistent.

---

## ⚪ 9. Leftover debug statements

- `src/app/services/mission.service.ts` (`assignSoldiersToMissionInstance`): `console.log(JSON.stringify(data));` logs assignment payloads on every call — remove.
- Effects use `console.error(err)` in `catchError` — route through the interceptor/a logging service instead.

## ⚪ 10. Production bundle budgets are effectively disabled

**Where:** `angular.json` → `configurations.production.budgets`.

```json
{ "type": "initial", "maximumWarning": "50000kb", "maximumError": "100mb" }
```
A 100 MB error ceiling means the build never warns about regressions. Set realistic limits (e.g., warn at ~1 MB, error at ~2 MB initial) so bundle bloat is caught in CI.

## ⚪ 11. Dockerfile hygiene

**Where:** `Dockerfile`.

```dockerfile
FROM node:hydrogen-alpine AS build
RUN npm install -g npm       # unnecessary global npm upgrade
RUN npm install              # non-reproducible; use the lockfile
...
FROM nginx:1.17.1-alpine     # released 2019 — many CVEs
```
Use `npm ci` (there is a `package-lock.json`), drop the global npm upgrade, and pin a current, patched nginx (e.g., `nginx:1.27-alpine`).

## ⚪ 12. Tests are generated stubs only

The `*.spec.ts` files are the default Angular CLI stubs. There is no meaningful coverage of the auth guards, NgRx reducers/effects, or the assignment flows — the highest-risk logic. Add unit tests (guards, reducers, effects with `provideMockStore`/`provideMockActions`) before refactoring the security items above.

---

## Suggested remediation order

1. **Move the security boundary to the server:** rely on server-issued tokens; treat guards as UX only; add an auth interceptor. *(#1, #2, #5)* — pairs with backend findings #1–#3.
2. **Stop leaking data / fix prod config:** gate the `logger` meta-reducer to dev, set a real production `serverURL`, remove debug `console.*`. *(#3, #4, #9)*
3. **Make it deployable & SSR-safe:** fix the nginx copy path, guard `localStorage` behind `isPlatformBrowser`. *(#6, #7)*
4. **Hardening & quality:** add HTTP interceptors, tighten budgets, modernize the Dockerfile, add real tests. *(#8, #10, #11, #12)*

> Because the frontend and backend share an enum/contract surface, coordinate the auth work across both projects (token issuance in `ShabzakAPI`, token attachment/refresh here).

