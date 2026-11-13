# God's View of the Agent — implementation audit

## Scope decision

This implementation is additive. The existing Swiss Ephemeris, geocentric planetary calculation, optional topocentric lunar correction, Equal House, Horary significator, transit, fixed-star, and interpretation flows remain in place. The relationship layer uses one canonical longitude in both God and Agent frames.

## Audit before implementation

| Specification area | Existing state | Gap before this change |
|---|---|---|
| One astronomical position | The app already stored one `longitude` per calculated row and exposed `godHouse`/`agentHouse` fields. | There was no structured object explaining the relationship between the two frames. |
| God View | Existing fixed Aries-to-Pisces mapping in `godHouseFor()`. Standalone God View does not require an Ascendant or personal location. | The UI showed the fixed frame, but did not explain how it relates to the Agent frame. |
| Agent View | Existing geocentric body calculation, optional topocentric lunar longitude, Ascendant, and 30-degree Equal House assignment. Transit houses expose whether they use the transit or natal location. | The UI exposed houses but did not provide a deliberate translation back to the broader frame. |
| Relationship layer | Prompt guidance mentioned God/Agent context. | No typed relationship classification, themes, translation, tension, concealment, or synthesis existed. |
| AI evidence trail | AI received `godPlacements` and basic house fields. | The relationship layer was not supplied as a named structured evidence set. |
| Main chart UI | Worldview buttons and dual-house labels existed. | No paired God View / Agent View / Relationship presentation made the “same body” concept explicit. |
| Horary | Horary correctly calculated significators, Moon, aspects, lookahead, transit evidence, and God View evidence. | Horary did not show or pass a dedicated God/Agent translation layer. |
| Automated tests | Core God/Agent math, God stability in standalone mode, canonical longitude with optional lunar parallax, and Horary calculation are covered. | No tests covered relationship classification, metadata propagation, or same-row dual presentation. |

## Implemented expansion

### Structured relationship model

`server/astrologyCore.ts` now contains:

- `FrameRelationshipType`: `convergence`, `translation`, `tension`, and `concealment`.
- `FrameRelationship`: God themes, Agent themes, translation text, optional tension text, and synthesis text.
- House-theme vocabulary for all twelve frames.
- `buildFrameRelationship(godHouse, agentHouse)`.
- Relationship metadata attached by `dualPlacement()` without recalculating a longitude.

Classification rules are intentionally transparent:

- Same house → **Convergence**.
- Agent House 12 → **Concealment / behind the scenes**.
- Opposite house axis → **Tension**.
- Other different frames → **Translation**.

### Placement contract

`ChartRow` now carries optional `frameRelationship` metadata. The existing `longitude`, `godHouse`, and `agentHouse` values remain intact. Natal rows, transit rows, nodes, angles, and frozen-star rows can all carry the same relationship structure when both frames are available.

### Interpretation engine

`server/interpretation.ts` now passes a named `frameRelationships` evidence set to the AI layer and instructs the interpreter to:

- Treat the longitude as one astronomical fact.
- Keep God and Agent houses separate.
- Use the supplied relationship type and translation.
- Treat God View as contextual, not as a replacement for rulers, aspects, or Horary testimony.
- Avoid match scores, “agree/shift” metrics, deterministic claims, or invented factors.

### Horary integration

Horary placements preserve their God/Agent metadata. Horary evidence now includes a dedicated relationship section. The Horary page displays a paired translation panel while keeping traditional Horary testimony primary.

### User interface

`client/src/components/FrameRelationshipPanel.tsx` presents:

1. **God View** — broader shared field.
2. **Agent View** — local lived channel.
3. **Relationship** — translation between the two.

Each placement shows:

- One calculated position.
- God House and themes.
- Agent House and themes.
- Relationship classification.
- Translation.
- Tension when applicable.
- Synthesis.

The panel is visible in the main chart result and in Horary results.

### Test coverage added

`server/god-agent-relationship.test.ts` verifies:

- Convergence classification.
- Opposite-axis tension classification.
- Private Agent-channel concealment classification.
- Same longitude shared by the chart row and dual placement.
- Relationship metadata propagation.
- Existing transit location responsibilities remain explicit.

## Validation

- TypeScript: `pnpm check` passed.
- Full tests: **12 test files, 47 tests passed**.
- Production build: `pnpm build` passed.

## Remaining gaps / architectural notes

### 1. Explicit canonical-position contract

Standalone `worldview: "god"` calculations are location-independent and covered by existing tests. Agent and dual calculations now use the same canonical geocentric longitude for signs, God Houses, stars, aspects, contacts, and evidence. When a location is resolved, the Moon may also carry `topocentricLongitude` for Agent-specific parallax use; it never replaces `longitude`. Topocentric calls isolate and restore Swiss Ephemeris observer state, and natal-only requests return transit fields sanitized away.

Transit results also expose `transitHouseFrame` (`transit-location`, `natal-location`, or `god-fixed`) and `momentPrecision` (`exact` or `date-only-reference`) so interpretation never has to infer the coordinate frame or whether noon UTC was an intentional approximation.

### 2. Relationship prose is deterministic house-theme scaffolding

The structured layer provides transparent, reusable synthesis text. The AI interpreter can deepen it using the supplied chart evidence, but the app does not yet persist a separate generated relationship paragraph per body. The evidence trail is structured and available to the interpreter; persistent narrative storage can be added with the reading-book/export work.

### 3. Fixed stars and secondary layers

The relationship metadata is available to frozen-star rows and calculated points when both frames exist. The UI currently emphasizes moving bodies and angles first. Dedicated relationship cards for every fixed star, Manzil, Nakshatra, and decan would be a follow-on density/UX decision rather than a calculation change.

### 4. Combined natal + transit relationship narrative

The data contract supplies relationship metadata for both natal and transit rows, and the AI prompt receives the evidence. A dedicated visual “Natal relationship → Transit relationship → Activation” timeline is not yet a separate component.

## Conclusion

The existing astronomy engine was not replaced. God's View of the Agent is now a first-class additive interpretation layer with structured relationships, evidence-aware AI instructions, Horary integration, visible paired UI, and automated coverage. The remaining notes are explicit architectural choices for a future canonical-position split and richer narrative/export presentation, not hidden failures in the delivered layer.
