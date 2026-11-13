# Guardian account and session repair

The account page now uses the independent registration/login endpoints instead
of the static "sign-in paused" page. The application shell resolves `auth.me`
before opening profiles and keys the profile provider by the authenticated
`openId`. Account changes remount the provider, clearing the preceding account's
in-memory charts and callbacks. Anonymous device use remains available.

Blank optional environment values no longer become empty session project IDs
or mask a configured signing secret. A signed session must validate against the
same nonempty application ID. Production requires a persistent signing secret
of at least 32 characters; keep this secret unchanged across deployments.

Database failures are reported as temporary account failures, rather than a
successful anonymous response. Private procedures preserve that error. Logout
still clears the cookie if the account database is unavailable. Public chart
calculations remain available. The sign-in form verifies the returned cookie
with `auth.me` before claiming the session is established.

Device birth profiles are **browser-local**, including after signing in. The
account-scoped chart/reading archive is server-backed. Existing legacy and guest
profiles are preserved and offered for explicit import into the signed-in
account's local browser space; no other account's namespace is imported.

## Deployment requirements

- `DATABASE_URL`: a persistent MySQL connection with the existing `users`,
  `saved_charts`, and `saved_readings` schema applied. Account credential-table
  setup requires schema permissions on first use.
- `JWT_SECRET` or `MANUS_JWT_SECRET`: one stable, private value of at least 32
  characters. Empty optional aliases are ignored.
- `MANUS_PROJECT_ID` or `VITE_APP_ID`: optional stable application ID. Empty
  values use `firmament-guardian` consistently.
- The independent account flow does not require Manus OAuth configuration.
- HTTPS is required for the deployed session cookie. The server trusts the
  first reverse proxy, as required by the hosting configuration.

The account availability endpoint checks session configuration and real account
storage before exposing credential fields. A successful build is not evidence
that the hosting service's database or secrets are configured.

## Verification

The session HTTP tests exercise the actual tRPC middleware, signing, cookies,
session restoration, account-isolated archive access, expired/wrong-app tokens,
logout, and account-database failures. Only the credential repository is stubbed
in those HTTP tests; password hashing and credential failures have separate
tests. Browser-storage rendering tests verify account separation and preservation
of the old guest namespace. These tests do not claim verification of a live
production database or OAuth account.
