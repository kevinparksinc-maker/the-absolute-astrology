# Bible Believers Astrology — Deep Audit Report

**Audit date:** 2026-10-05  
**Repository:** `kevinparksinc-maker/firmament-guardian`  
**Audited commit before this report:** `97e8cc9`

## Executive status

The core astrology application is healthy, but it is **not yet a full no-findings release**.

### Passing areas

- TypeScript compilation passes.
- All automated tests pass: **13 test files, 51 tests**.
- Production build passes.
- Production server starts and serves the application.
- Health endpoint passes.
- Main application routes render.
- Geocoding works.
- Chart calculation works end to end.
- The main browser chart flow renders a populated chart with houses, natal placements, transit contacts, chart wheel, and God/Agent relationship panels.
- Browser console remained empty during home-page, chart-calculation, and Horary-page rendering checks.
- Anonymous authentication state behaves correctly (`auth.me` returns `null`).

### Findings that remain open

1. **High — Horary full-judgment request is too slow in the current runtime.** The Horary calculation path reaches the server, but a complete `horary.open` request did not return within a 40-second smoke-test timeout. Server logs showed the OpenAI-compatible fallback entering a no-visible-text retry path. The simple `interpretation.host` endpoint succeeds in approximately 2.3 seconds, so the provider itself is available; the issue is specific to the much larger Horary evidence/prompt request and/or model-token behavior.
2. **High — OAuth is not configured in the local runtime.** Startup logs report `OAUTH_SERVER_URL is not configured`. Public/anonymous browsing works, but account login and private archive actions cannot be considered fully verified until the deployment environment supplies OAuth configuration.
3. **High — Dependency audit reports unresolved vulnerabilities.** `pnpm audit --prod` reported 1 critical, 23 high, 55 moderate, and 10 low findings. The most important direct or production-reachable findings include `fast-xml-parser`, `@trpc/server`, `axios`, `drizzle-orm`, `form-data`, `mysql2`, `nanoid`, `lodash`, `dompurify`, `mermaid`, and `qs`. These should be upgraded in a dedicated dependency-remediation pass with regression testing.
4. **Medium — Production bundle-size warning.** The build succeeds, but several chunks exceed 500 kB after minification, including the main bundle at roughly 1.55 MB before gzip. Code splitting and lazy loading should be considered before adding more feature-heavy modules.
5. **Medium — Formatting is not clean.** Prettier reported style differences in 72 files. This does not break the build, but it increases review and maintenance friction.
6. **Medium — Horary evidence TODO remains open.** `TODO.md` states that the generated Horary judgment still needs to explicitly use the exact God View/Agent View entries shown in the evidence box. The server prompt contains a strong instruction for this, but the behavior still needs a successful live response assertion.
7. **Low — Several API inputs use broad `z.any()`/`any` contracts.** In particular, chart results passed to interpretation and follow-up procedures are not structurally validated at the router boundary. This is a type-safety and input-hardening opportunity.

## Validation performed

### Repository and package validation

- Git branch: `main`.
- Working tree was clean before the audit fix.
- `pnpm install --frozen-lockfile`: passed.
- Corrected pnpm 10 configuration by moving `patchedDependencies` and `overrides` from `package.json` to `pnpm-workspace.yaml`; the install no longer emits the ignored-settings warning.
- `pnpm check`: passed.
- `pnpm test`: passed — 13 files / 51 tests.
- `pnpm build`: passed.
- `git diff --check`: should be run before the final remediation commit.

### Automated test inventory

The passing suite covers authentication logout, chat history, astronomy engine fixes, God/Agent relationships, Horary input and calculations, Horary lookahead, hybrid calculations, interpretation modes, LLM response shapes, master interpreter behavior, transit time, and transit calculations.

### HTTP/runtime checks

Against the local production server on port 4173:

| Endpoint/flow | Result |
|---|---|
| `GET /health` | HTTP 200, `{ "ok": true }` |
| `GET /api/runtime-config` | HTTP 200; local runtime has empty external config values |
| `GET /` | HTTP 200, application HTML |
| `GET /sky` | HTTP 200, application HTML |
| `GET /horary` | HTTP 200, application HTML |
| `GET /history` | HTTP 200, application HTML |
| `GET /404` | HTTP 200, SPA fallback HTML |
| `GET /api/trpc/auth.me` | HTTP 200, anonymous `null` |
| `GET /api/trpc/hybrid.geocode` | HTTP 200; Dallas resolved with coordinates and `America/Chicago` |
| `POST /api/trpc/hybrid.calculate` | HTTP 200; 10 moving bodies, 12 transits, 12 houses, 10 frozen stars; validation passed |
| `POST /api/trpc/interpretation.host` | HTTP 200; response in approximately 2.3 seconds |
| `POST /api/trpc/horary.open` | Input schema validation works, but the complete AI-backed request exceeded the 40-second smoke timeout |

### Browser checks

The Sandbox browser verified:

- Home page rendered with no console output/errors.
- Location, date, time, and transit fields accepted input.
- Birth and transit locations resolved successfully.
- Chart calculation completed in the UI.
- Populated chart rendered with chart wheel, natal placements, transit contacts, houses, and frame-relationship content.
- Horary page rendered with question field, subject selector, topic-house selector, location field, optional natal layer, date/time controls, and cast button.
- Horary page console remained empty during initial render.

## Packaging fix applied during audit

Pnpm 10 reported:

> The `pnpm` field in package.json is no longer read by pnpm.

The repository had placed `patchedDependencies` and `overrides` under the `pnpm` key in `package.json`. Those settings are now stored in `pnpm-workspace.yaml`, where pnpm 10 reads them. A frozen install, type-check, test suite, and production build all passed after the change.

## Recommended remediation order

1. Fix the Horary AI request path: measure evidence size, cap/restructure prompt size, select a model/request shape that returns visible text reliably, and add a live integration test with a bounded timeout.
2. Configure OAuth in the target deployment and verify login, private chart save, archive loading, and logout.
3. Upgrade direct and production-reachable vulnerable packages in a controlled batch; rerun tests, build, and API smoke tests after each batch.
4. Add structural schemas for chart-result and interpretation inputs instead of `z.any()`.
5. Split heavy client modules and lazy-load Mermaid/charting/technical showcase code.
6. Run Prettier in a dedicated style-only commit, then enforce `prettier --check` in CI.
7. Close the remaining Horary evidence TODO with a live assertion that every displayed relationship row is represented in the generated first judgment.

## Conclusion

The **core chart engine and main UI are functioning**, and the application is suitable for continued feature development. It should not yet be labeled fully production-clean because the complete Horary AI flow, OAuth-dependent account flows, and dependency security posture still require remediation and verification.
