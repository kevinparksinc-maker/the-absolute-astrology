# The Absolute — first phone release checklist

## One production service
Render's Docker service builds the React frontend and the Node/Express/tRPC backend together. Import the repository as a Render Blueprint using `render.yaml`, or attach the existing Render service to the main branch and use the Dockerfile. The free instance can sleep when idle.

## Secrets (Render dashboard, not GitHub)
- `JWT_SECRET`: a random 32+ character secret. The app now refuses to boot in production without one.
- `ANTHROPIC_API_KEY`: Claude API credential for the server-side interpreter. Never prefix with `VITE_` or expose it to the client.
- `DATABASE_URL`: persistent database connection for profiles/history, if those features are enabled.
- `OAUTH_SERVER_URL`: required only for the current Manus-compatible OAuth flow; check that this auth provider is reachable from Render.
- The provider status endpoint can report configured/unconfigured, but a real end-to-end AI response is required to verify credentials.

## Smoke test after deployment
1. Confirm `https://YOUR-RENDER-URL/health` returns `{"ok":true}`.
2. Open `/` and `/sky` in Android Chrome. Confirm neither remains on the loading shell.
3. Load a chart, inspect planetary positions and the God/Agent chart views.
4. In Sky, supply a known XYZ vector such as `{"Mars":{"x":1,"y":1,"z":0}}`, Apply, then Recalculate. Verify Mars appears at 45° in the chosen fixed zodiac plane. Remove it and confirm fallback.
5. Verify natal/transit positions, Horary AI status, and a real Claude answer. If AI is unavailable, show the deterministic fallback clearly.
6. Verify saved profiles/history survive a restart. If not, do not advertise persistence.
7. In Android Chrome, open the three-dot menu and choose Add to Home screen or Install app. A manifest is present, but installation availability and icon behavior must be tested on the device.

## Release blockers
- Automatic real XYZ vector source and its fixed-frame calibration are not complete.
- Historical sunrise anchored geometric Ascendant is not complete.
- Unit tests and TypeScript/build checks have not yet been verified against the merged branch.
- Stitch homepage, profile persistence, and the full method synthesizer still need end-to-end verification.
- Render deployment status and Claude credential are unknown until checked on the actual service.

Do not treat GitHub merge as proof of a live deployment.
