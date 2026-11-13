# Bible Believers Astrology mobile visual system

## Prototype routes

- `/sky` — Sky Home prototype with the starfield hero, launch actions, overlay map explorer, and bottom navigation.
- Sky Home’s **Orrery** tab opens the interactive three-layer orrery screen.
- `/horary` remains the full Horary workflow and can be linked from Sky Home.

## Screen architecture

### Sky Home

- **Top:** Bible Believers Astrology wordmark, “The living sky” title, exit/back action.
- **Hero:** atmospheric starfield, one-sentence promise, primary “Open three-layer orrery” action.
- **Quick actions:** Ask Horary and Explore Maps.
- **Map module:** horizontal system selector with Zodiac, Nakshatra, Manazil, and Decan.
- **Bottom navigation:** Sky, Orrery, Maps, Guide.

### Three-Layer Orrery

- **Layer selector:** Natal / Transit / God View tabs.
- **Central visualization:** concentric SVG rings with consistent semantic colors.
- **Planet detail grid:** body glyph, degree/context, and layer-specific explanation.
- Reading rule: local houses belong only to Natal / Agent; God View remains geocentric and observer-independent. Planetary longitude is canonical and geocentric in both frames; Agent View may additionally expose a topocentric lunar correction when a location is resolved.

## Semantic color tokens

| Layer or system | Color | Meaning |
|---|---:|---|
| Natal / Agent | `#F6AE2D` | Personal foundation, local houses, birth chart |
| Transit | `#9D4EDD` | Question moment and activation |
| God View | `#00E5FF` | Geocentric whole-sky frame |
| Zodiac | `#F0F4F8` | Neutral base coordinate system |
| Nakshatra | `#F6AE2D` | Indian / Vedic lunar mansion band |
| Manazil | `#9D4EDD` | Arabic lunar mansion band |
| Decan | `#00E5FF` | Egyptian / Hellenistic 10° divisions |

## Overlay-map asset specifications

### Common requirements

- Prefer SVG for rings, tick marks, labels, and selectable segments.
- Use Canvas only when rendering hundreds of moving points or animated time playback.
- Keep the base visual at 360° and map longitude linearly from left to right.
- Maintain a minimum mobile touch target of 44 × 44 px, even when visual segments are narrower.
- Every selected segment needs a high-contrast halo, a short tooltip, and an “explore meaning” action.
- Never combine Nakshatra and Manazil names into one undifferentiated label. Show their tradition/source labels.

### Zodiac

- 12 segments × 30°.
- Logical mobile strip: 360 × 44 px.
- Neutral ivory ticks and sign labels.
- Use as the shared base reference for every other overlay.

### Nakshatra

- 27 segments × 13°20′.
- Four padas per segment, for 108 pada ticks.
- Logical mobile strip: 360 × 64 px.
- Amber highlight for the active mansion and Moon position.
- Tap state should reveal: name, pada, degree span, ruler, and short meaning.

### Manazil

- 28 segments × 12°51′26″ approximately.
- Logical mobile strip: 360 × 64 px.
- Violet band with alternating segment opacity.
- Long transliterated names need a two-line tooltip and accessible text label.
- Tap state should reveal: name, degree span, source label, and short meaning.

### Decans

- 36 segments × 10°.
- Logical mobile strip: 360 × 52 px.
- Cyan 10° grid ticks.
- Show the decan ruler in the selected state rather than cramming all ruler names into the base map.

## Product visual rules

1. **One visual question per screen.** Do not put a full dashboard, a chart wheel, and a long interpretation above the fold together.
2. **Color means coordinate frame.** Keep amber, violet, and cyan consistent across the app.
3. **Evidence before prose.** Show the map, degree, layer, and source system before the AI interpretation.
4. **Progressive disclosure.** Start with a readable visual summary, then let users open technical details.
5. **Mobile first.** Design for a 390–430 px viewport, then widen the same modules for tablet and desktop.
