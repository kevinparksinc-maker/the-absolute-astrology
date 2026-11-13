# Bible Believers Astrology Premium App Plan

## Product scope

Upgrade Bible Believers Astrology into a private personal observatory rather than a calculator with AI attached. The first premium build covers roadmap items 1–8: exceptional first session, premium visual chart exploration, guided AI readings, persistent personal history, daily/monthly return value, relationship intelligence, trust/privacy, and premium exports.

The existing public chart calculation, natal/transit/combined reading modes, AI host, chapter generation, transit calculations, and live deployment remain intact. New functionality must be additive and must not remove the current calculation or interpretation paths.

## Architecture and delivery stages

1. **Premium foundation and visual explorer**: add a guided dashboard shell, calculation deep-dive state, evidence-linked placement/aspect details, timeline-ready data contracts, and premium visual hierarchy. Preserve the current hover/focus deep dives and extend them into persistent selection and “why this matters” panels.
2. **Accounts and durable profiles**: use the existing Manus OAuth flow and `webdev_app_session`; add authenticated profile, saved chart, saved reading, bookmark, note, and journal records in the managed MySQL-compatible database. User-owned records must be scoped by authenticated `openId`.
3. **Reading book**: turn six generated chapters into a navigable reading-book experience with chapter progress, chart-evidence blocks, bookmarks, private notes, follow-up questions, and regeneration tone controls. Public generation remains available; persistence requires login.
4. **Return loop**: add a transit timeline, daily briefing, monthly outlook, upcoming major-transit cards, and reflection prompts derived from the saved natal chart. Scheduled generation can be added after the interactive path is stable.
5. **Relationship intelligence**: add a second saved profile and synastry/relationship workspace covering attraction, communication, friction, trust, shared transits, and a non-deterministic interpretation disclaimer.
6. **Trust and privacy**: add methodology, accuracy/limitations, AI evidence disclosure, timezone/house-system visibility, privacy controls, data export, and soft-delete controls. Never make deterministic claims about medical, death, legal, or guaranteed outcomes.
7. **Premium exports**: generate designed PDF readings, printable charts, monthly reports, audio readings, and private share links. Store generated assets in managed object storage and index ownership in the database.
8. **Polish and installability**: refine responsive motion, empty/loading/error states, accessible focus behavior, PWA metadata, performance, and premium visual consistency across Home, Horary, reading book, relationship, and history routes.

## Design direction

- **Design movement**: editorial astronomical observatory—dark instrument panels, archival paper cues, and precise luminous data marks.
- **Core principles**: explain the evidence; make complexity feel navigable; use motion to reveal rather than distract; keep the user in control of interpretation and privacy.
- **Color philosophy**: deep ink and blue-black create focus, cyan marks live/transit activity, violet marks interpretation and guidance, amber marks immutable stars and archival truth, and rose marks tension or caution.
- **Layout paradigm**: a vertical observatory field with a persistent reading rail, expandable calculation surfaces, and chapter-oriented navigation instead of a generic centered dashboard grid.
- **Signature elements**: luminous orbital lines, archival “field notes,” and expandable calculation cards that expose exact evidence.
- **Interaction philosophy**: hover/focus reveals on desktop, tap/focus equivalents on touch, explicit selection for persistent context, and reversible optimistic saves with clear errors.
- **Animation**: short 160–240ms opacity/translate transitions for reveal panels; slow orbital ambient motion only in decorative layers; respect reduced-motion preferences.
- **Typography**: Playfair Display/Georgia-style serif for interpretation and chapter titles; compact sans/mono labels for coordinates, timestamps, and system state.
- **Brand essence**: a private personal observatory that explains how the sky meets your story. Personality: precise, intimate, luminous.
- **Brand voice**: direct, reflective, evidence-aware. Example lines: “Start with the sky you want to understand.” and “Here is the chart evidence beneath this interpretation.”
- **Wordmark/mark**: preserve the Bible Believers Astrology wordmark and develop a small orbital-guardian mark for saved readings and exports.
- **Signature brand color**: luminous cyan `#67e8f9`, reserved for active discovery and evidence links.

## Project structure

- `client/src/pages/Home.tsx`: chart entry and visual explorer shell.
- `client/src/components/ChartWheel.tsx`: interactive wheel and selected-focus context.
- `client/src/components/InterpretationPanel.tsx`: chapter navigation, generation, follow-up, and evidence surfaces.
- `client/src/pages/ReadingBook.tsx`: persistent reading-book route and chapter experience.
- `client/src/pages/History.tsx`: saved charts, readings, bookmarks, notes, and journal.
- `client/src/pages/Relationships.tsx`: two-profile relationship workspace.
- `client/src/pages/Settings.tsx`: privacy, methodology, export, and account controls.
- `client/src/components/premium/`: reusable evidence cards, timeline, save controls, and export status UI.
- `server/routers.ts`: authenticated profile/history/reading/relationship/export procedures.
- `server/db.ts`: ownership-scoped database queries and persistence helpers.
- `drizzle/schema.ts`: additive tables and indexes for profiles, charts, readings, notes, journals, relationships, and exports.
- `server/interpretation.ts` and `server/astronomy.ts`: existing calculation/AI contracts extended with evidence metadata and timeline facts.
- `server/storage.ts`: durable export asset integration and ownership metadata.

## Data and capability decisions

- Use Manus OAuth by default; do not add email/password authentication.
- Use the already-enabled managed server and database capabilities.
- Keep chart calculation and first-look exploration usable without login; require login to save or synchronize private records.
- Scope every private record to the authenticated user; never trust a client-provided owner ID.
- Use additive migrations only. No destructive schema changes are planned.
- Use managed storage for generated PDFs/audio and store object keys plus ownership metadata in the database.
- Defer real payment/subscription activation until the product entitlements and premium catalog are designed and explicitly selected.

## Verification and delivery

Use automatic TypeScript diagnostics, existing Vitest coverage, database migration checks, route-manifest checks, and production build checks. Validate actual API responses against the frontend contracts. Preserve the current public URL and publish each completed stage from a canonical main checkpoint.

## Approved deployment execution amendment — October 2026

### Scope
Deploy the supplied Bible Believers Astrology archive as a production-ready managed web application. The deployment imports and builds the existing application without removing or rewriting its pages, content, interactions, routes, or visual presentation. Work in this delivery is limited to runtime compatibility, dependency/build reliability, managed database/authentication integration, deployment configuration, and verification.

### Approved visual decision
The confirmed **Modern Apocrypha** direction—serious editorial presentation, charcoal surfaces, and restrained crimson accents—sets the quality bar for the deployed experience. Because the approved scope requires the archive's current visual presentation to be preserved, this deployment does not restyle the product; the existing authored UI remains the source of truth. Any future visual iteration should use Modern Apocrypha as its reference without disturbing existing chart and reading workflows.

### Production implementation
- Import the complete archive into the managed Git workspace, retaining the existing React/Vite client, Express/tRPC server, Drizzle schema and migrations, routes, assets, tests, and `app.config.ts` branding metadata.
- Use the managed server and MySQL-compatible database already enabled for this project. Apply the committed non-destructive Drizzle migrations before validating history-saving functionality.
- Preserve public chart calculation, interpretation, horary, and visual observatory flows. Align the existing OAuth/session code with the managed Manus runtime environment so authenticated history remains compatible with Preview and production.
- Keep the application server as the sole public target. Its Docker image installs the pinned pnpm toolchain with the lockfile and workspace lifecycle policy, builds Vite assets and the Express entry point, honors `PORT`, and exposes unauthenticated `GET /health`.
- Use the existing `manus-routes.json` as the route contract, updating it only if source routes differ. Validate it directly from the running application.

### Deployment project structure
- `client/`: preserved React application, public assets and route manifest.
- `server/`: preserved Express/tRPC APIs, astronomy and interpretation services; only platform-runtime compatibility fixes are permitted.
- `drizzle/`: existing additive schema migrations applied to the managed database.
- `Dockerfile`: production image contract; copies all install-policy inputs before `pnpm install`.
- `plan.md` and `TODO.md`: recorded deployment scope and completion evidence.
