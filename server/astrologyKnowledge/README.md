# Astrology Knowledge Evidence Trace

The knowledge gateway is deterministic and inspectable before any LLM call.

## Developer endpoint

When the server is not running in production, call the tRPC mutation:

```text
astrologyKnowledge.diagnose
```

Input:

```json
{
  "chart": { "...": "ChartResult" },
  "question": "Why do my relationships keep repeating the same pattern?",
  "mode": "combined"
}
```

The response contains:

- `question`
- `selectedSubjects`
- `selectedTechniques`
- `packet.chartFacts`
- Western, Vedic, Arabic, lunar, fixed-star, and timing evidence
- relationships, convergences, contradictions, and uncertainties
- `incomplete` rule/provider statuses
- `sourceTrace` with source ID, tradition, technique, rule ID, provider, URL where applicable, calculation settings, timestamp, confidence, and implementation status
- `readableTrace`

The endpoint intentionally refuses production execution. The same `diagnoseAstrologyEvidence` function is used by tests and by the development router, so the inspection object is not a second implementation.

## Boundary and integration tests

```bash
pnpm test -- server/patterns/patternMatcher.test.ts server/astrologyKnowledge
pnpm check
```

The integration test intercepts the actual LLM adapter and asserts that `ASTROLOGY EVIDENCE PACKET` enters the generate, chapter, and follow-up request payloads. Follow-up calls create a fresh packet using the new question.
