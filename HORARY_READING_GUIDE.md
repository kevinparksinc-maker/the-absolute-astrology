# Horary Reading Guide

## Purpose

The Horary AI is designed to make the user feel that the question was genuinely examined—not merely that a chart was generated. It performs deep analysis internally, weighs testimony hierarchically, and translates the result into clear, compassionate, practical language.

The shared philosophy is stored in [`server/firmament-master.ts`](./server/firmament-master.ts). Horary-specific rules are layered on top from [`server/horary-instructions.ts`](./server/horary-instructions.ts).

> **Calculate deeply. Judge hierarchically. Interpret humanly.**

> **Care-centered imperative:** Every meaningful placement, aspect, calculation, and judgment must come back to what it means for this specific person, how it may manifest in the life situation they described, and what understanding or agency it gives them. Care is not decorative tone; it is the interpretive method and the central quality standard.

## What happens when a question is submitted

1. **The question is fixed.** The app uses the date, local time, timezone, and resolved location where the question was asked.
2. **One question chart is calculated.** The astronomy engine calculates the Ascendant, Equal House cusps, planetary longitudes, speeds, retrogrades, and the canonical geocentric Moon position.
3. **Roles are assigned.** The person asking is the querent, represented by House 1 and its traditional ruler. If the question is about another person, that person is represented by House 7. The selected topic house is counted from the person the question is about. The Moon is treated as a major indicator of unfolding circumstances.
4. **The engine supplies the relevant evidence.** This includes significators, house rulers, planetary conditions, applying and separating aspects, reception, Moon sequence, traditional factors, timing aids, lunar subdivisions, fixed-star testimony, and the distinct God View and Agent View layers when available.
5. **The AI examines the whole relevant sky.** The model is not limited to a compact summary. It receives the complete calculated evidence and is instructed to determine what the user is actually asking, which factors genuinely relate to it, what supports the answer, what modifies or contradicts it, and which evidence is strongest.
6. **The AI judges hierarchically.** Evidence is treated as primary, supporting, modifying, contradictory, timing, or contextual testimony. The system does not count positive and negative factors like votes, and secondary systems do not automatically override core horary testimony.
7. **The AI translates the result into human meaning.** It preserves the user’s actual wording and context, explains technical language in ordinary terms, acknowledges uncertainty, avoids invented facts, and offers a grounded next step when appropriate.

## The user-facing reading

The answer should normally include:

- **Judgment:** the direct answer and its category, such as yes, no, leaning yes, leaning no, mixed/conditional, delayed, or insufficient testimony;
- **Why:** the strongest converging factors and what they mean in this question;
- **What complicates it:** obstacles, contradictions, delays, uncertainty, or conditions;
- **What this means for you:** the translation from astrological testimony into the user’s lived situation;
- **Practical next step:** grounded guidance that preserves the user’s agency.

The reading should feel like a conversation rather than a textbook or computer-generated report. A simple question can receive a concise answer. A question carrying significant emotional, relational, financial, or life-direction weight should be allowed to breathe. The goal is not short output; it is meaningful understanding.

The interface places **Your answer** before the technical evidence, but the answer is now based on the full evidence set rather than a shortened calculation summary. The technical evidence remains available for inspection afterward.

## Personal resonance without manipulation

The interpreter should connect symbolism to the human reality of the question so the user can recognize the situation, while never pretending to know undisclosed facts. It must not manufacture intimacy, claim supernatural certainty, create fear or dependency, tell the user what they secretly feel without evidence, or present speculation as fact.

The intended tone is compassionate without being sentimental, direct without being cold, and profound without being theatrical. Resonance is not certainty.

## Technical evidence and boundaries

The technical panel may include chart data, significators, rulers, planetary conditions, aspects, applying/separating status, reception, dignity/debility, Moon sequence, lunar mansion, Manzil, Decan, Nakshatra, fixed stars, God View, Agent View, translations, timing indicators, Lots, Arabic Parts, and other calculated testimony.

The panel is for inspection. The user-facing judgment is for understanding. The interpreter must not invent absent placements, aspects, dates, degrees, houses, traditional doctrines, or historical correspondences. Exact planetary contacts must not be presented as guaranteed real-world events.

Horary remains a symbolic interpretive tradition rather than scientifically established proof. It must not replace qualified medical, legal, financial, or mental-health advice.

## Follow-up questions

A follow-up remains anchored to the original horary chart and question. The system does not silently recast the chart. It uses the existing evidence to answer what the user is asking now, and only treats the interaction as a new horary when it is genuinely a new question rather than a clarification of the original one.
