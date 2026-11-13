import type { GameChartSnapshot, GameMethod, MethodResult } from "./contracts";

/** Methods cannot silently overwrite evidence or contribute fabricated scores. */
export function evaluateGameMethods(snapshot: GameChartSnapshot, methods: readonly GameMethod[]): readonly MethodResult[] {
  const ids = new Set<string>();
  const evidenceIds = new Set([...snapshot.chartEvidence, ...snapshot.physicalEvidence].map(item => item.id));
  const results: MethodResult[] = [];
  for (const method of methods) {
    if (ids.has(method.id)) throw new Error(`Duplicate Simulation Lab method: ${method.id}`);
    ids.add(method.id);
    const result = method.evaluate(snapshot);
    if (result.methodId !== method.id) throw new Error(`Method ID mismatch: ${method.id}`);
    if (result.ascScore !== null && (!Number.isFinite(result.ascScore) || result.ascScore < 0)) throw new Error(`Invalid ASC score: ${method.id}`);
    if (result.descScore !== null && (!Number.isFinite(result.descScore) || result.descScore < 0)) throw new Error(`Invalid DESC score: ${method.id}`);
    for (const id of result.evidenceIds) {
      if (!evidenceIds.has(id)) throw new Error(`Untraceable evidence ${id} in method ${method.id}`);
    }
    if (result.verdict === "unavailable" && (result.ascScore !== null || result.descScore !== null)) {
      throw new Error(`Unavailable method must not emit scores: ${method.id}`);
    }
    results.push(Object.freeze(result));
  }
  return Object.freeze(results);
}
