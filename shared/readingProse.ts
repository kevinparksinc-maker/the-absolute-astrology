export function readingProse(text: string): string {
  if (!text) return "";
  return text
    .replace(/^Question:\s*(?:Compact individual placement card summaries|the chart's overall configuration)\.?\s*/i, "")
    .replace(
      /\[(?:TRADITION|MODERN_SYNTHESIS|FIRMAMENT CANON|TRADITION\s*\/[^\]]*)[^\]]*\]\s*/gi,
      ""
    )
    .replace(
      /\b(?:Psychological dynamic|Healthy expression|Defensive risk under pressure|Psychological field)\s*:\s*/gi,
      ""
    )
    .replace(/^\s*[“"]([\s\S]*)[”"]\s*$/, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}
