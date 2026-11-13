# Local pattern-matching engine

This module keeps the interpretation pipeline local and provider-agnostic:

- `types.ts` contains Zod-validated input/output contracts.
- `../utils/patternMatcher.ts` detects Western aspects (including 0°/360° wraparound) and synthesizes only signals present in at least two layers.
- `../services/tvamClient.ts` defines the Vedic provider interface, a guarded HTTP client for an authorized endpoint, response normalization, and `MockTvamProvider`.
- `../utils/arabicLots.ts` defines sect-sensitive Fortune/Spirit calculations, optional Eros, and `MockArabicProvider`.
- `index.ts` is the public server-side barrel export.

The real Tvam and Canopy apps do not supply a documented API in the attached material. The adapters therefore do not scrape or reverse-engineer either app. Supply an authorized endpoint later by constructing `new TvamClient({ baseUrl, apiKey })`, or inject a provider implementing the exported interface.

Example:

```ts
import {
  MockArabicProvider,
  MockTvamProvider,
  detectWesternAspects,
  synthesizeCrossSystemPatterns,
} from "./server/patterns";

const western = {
  placements,
  aspects: detectWesternAspects(placements),
  provider: "local-western",
};
const vedic = await new MockTvamProvider().getAnalysis({ chartId: "demo" });
const arabic = await new MockArabicProvider().getAnalysis({
  ascendant: 10,
  sun: 100,
  moon: 200,
  sect: "day",
});
const analysis = synthesizeCrossSystemPatterns({
  userQuestion,
  western,
  vedic,
  arabic,
  minimumScore: 0.35,
});
```
