# Runtime integrity checks for The Absolute on Render

The server exposes:
- `GET /health`: HTTP 200 when the Express process is serving requests. **Not** proof that charts, database, or AI work.
- `GET /ready`: HTTP 200 when session signing is configured; reports booleans for session signing, interpreter credentials and database URL. It never returns secret values. **Not** proof that external services accept the credentials.

For every production release:
1. Run `pnpm check`, `pnpm test`, and `pnpm build` and inspect failures. A merge is not a passing test.
2. Open `/health` and `/ready` on the actual Render URL.
3. Calculate a natal and a transit chart; confirm the same XYZ-derived planet coordinates appear in Sky, Master Chart and the Home synthesizer.
4. Confirm the Master Chart `validation.complete` and `validation.warnings` values. A reference-only Chinese mansion layer is **not** an executed personal placement calculation.
5. Request a real interpreter response, and confirm the provider was actually called.
6. Verify profile persistence across a Render restart. Ephemeral disk writes do not provide persistence.
7. Confirm an Android installation opens the deployed app and can complete a reading.

`/api/background-music` direct disk writes are disabled in production because the endpoint was unauthenticated and Render disk storage may be ephemeral. Replace with authenticated persistent object storage before re-enabling uploads.
