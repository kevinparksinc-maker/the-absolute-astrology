import { ENERGY_PLANET_STARS } from "@/lib/energyScoring";
export function EnergyScoringKey() {
  return (
    <details className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
      <summary className="cursor-pointer font-semibold text-cyan-200">
        How Harmony, Friction and strength are calculated
      </summary>
      <div className="mt-4 space-y-4 text-xs leading-6">
        <p>
          <strong className="text-teal-200">Harmony:</strong> conjunction,
          trine, sextile and semisextile.{" "}
          <strong className="text-rose-200">Friction:</strong> square,
          opposition, semisquare and quincunx. These labels describe the
          configured symbolic flow of a contact.
        </p>
        <p>
          Orb is the distance from an exact aspect angle. Only contacts within
          5° are counted. Intensity is 5 below 1°, 4 from 1° to below 2°, 3 from
          2° to below 3°, 2 from 3° to below 4°, and 1 from 4° through 5°.
        </p>
        <p>
          Contact points = intensity × first body's star weight × second body's
          star weight × aspect factor. Conjunction, sextile, square, trine and
          opposition use factor 1; minor aspects use 0.5. Each pair is counted
          once in its comparison.
        </p>
        <p>
          Harmony % = harmony points ÷ total harmony and friction points × 100.
          Percentages are weighted scores, so they do not equal the percentage
          of contacts. With no contacts, both scores are zero.
        </p>
        <p>The Energy assessment names the side with the greater weighted total and ranks the strongest contacts on each side. A close split does not imply that every life area is balanced; read the planetary pairs, placements and actions behind it.</p>
      <details>
          <summary className="cursor-pointer text-slate-200">
            Body weights
          </summary>
          <ul className="mt-2 grid gap-x-5 sm:grid-cols-2">
            {Object.entries(ENERGY_PLANET_STARS).map(([name, stars]) => (
              <li key={name}>
                {name}: {stars} stars
              </li>
            ))}
          </ul>
        </details>
      </div>
    </details>
  );
}
