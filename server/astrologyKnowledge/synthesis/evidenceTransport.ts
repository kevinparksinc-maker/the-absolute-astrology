/** Intern repeated values without dropping or shortening any evidence. */
export function encodeEvidence(value: unknown) {
  const counts = new Map<string, number>();
  const partsOf = (text: string) => text.split(/(?<=[.!?\n])(?=\s)/);
  const jsonValue = (text: string): object | undefined => {
    if (text.length < 100 || !/^[\[{]/.test(text)) return undefined;
    try {
      const parsed = JSON.parse(text);
      return parsed && typeof parsed === "object" && JSON.stringify(parsed) === text ? parsed : undefined;
    } catch { return undefined; }
  };
  const visit = (node: unknown): void => {
    if (node === null || typeof node !== "object" && typeof node !== "string") return;
    const key = JSON.stringify(node);
    if (key.length >= 100) counts.set(key, (counts.get(key) ?? 0) + 1);
    if (typeof node === "string") {
      const parsed = jsonValue(node);
      if (parsed) { visit(parsed); return; }
      const parts = partsOf(node);
      if (parts.length > 1) for (const part of parts) {
        const partKey = JSON.stringify(part);
        if (partKey.length >= 100) counts.set(partKey, (counts.get(partKey) ?? 0) + 1);
      }
    }
    if (Array.isArray(node)) node.forEach(visit);
    else if (typeof node === "object") Object.values(node).forEach(visit);
  };
  // Normalize undefined and other JSON-only details exactly once.
  const source: unknown = JSON.parse(JSON.stringify(value));
  visit(source);
  const references: unknown[] = [];
  const indices = new Map<string, number>();
  const encode = (node: unknown, inline = false, fragment = false): unknown => {
    if (node === null || typeof node !== "object" && typeof node !== "string") return node;
    const key = JSON.stringify(node);
    if (!inline && (counts.get(key) ?? 0) > 1) {
      let index = indices.get(key);
      if (index === undefined) {
        index = references.length;
        indices.set(key, index);
        references.push(null);
        references[index] = encode(node, true, fragment);
      }
      return { $evidenceRef: index };
    }
    if (Array.isArray(node)) return node.map(item => encode(item));
    if (typeof node === "object") return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, encode(v)]));
    if (typeof node === "string" && !fragment) {
      const parsed = jsonValue(node);
      if (parsed) return { $evidenceJson: encode(parsed) };
      const parts = partsOf(node);
      if (parts.length > 1 && parts.some(part => (counts.get(JSON.stringify(part)) ?? 0) > 1))
        return { $evidenceText: parts.map(part => encode(part, false, true)) };
    }
    return node;
  };
  const data = encode(source);
  return {
    evidenceFormat: "Lossless shared references. Replace every object containing only $evidenceRef with references[index], recursively. For $evidenceText, resolve each array element and concatenate IN ORDER. $evidenceJson contains the parsed value of a JSON string: resolve it and read it as the original calculated data. References may contain further references. All complete text, calculations, outcomes and Canon are retained. References are storage aliases, not evidence IDs or a ranking.",
    data,
    references,
  };
}

export function decodeEvidence(packet: ReturnType<typeof encodeEvidence>): unknown {
  const decode = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(decode);
    if (node && typeof node === "object") {
      const object = node as Record<string, unknown>;
      if (Object.keys(object).length === 1 && typeof object.$evidenceRef === "number")
        return decode(packet.references[object.$evidenceRef]);
      if (Object.keys(object).length === 1 && Array.isArray(object.$evidenceText))
        return object.$evidenceText.map(decode).join("");
      if (Object.keys(object).length === 1 && "$evidenceJson" in object)
        return JSON.stringify(decode(object.$evidenceJson));
      return Object.fromEntries(Object.entries(object).map(([k, v]) => [k, decode(v)]));
    }
    return node;
  };
  return decode(packet.data);
}

export function stringifyEvidence(value: unknown): string {
  return JSON.stringify(encodeEvidence(value));
}
