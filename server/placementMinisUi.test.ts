import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import { calculateChart } from "./astronomy";
import { SystematicDeconstruction } from "../client/src/components/SystematicDeconstruction";
const state = vi.hoisted(() => ({
  data: undefined as any,
  error: null as Error | null,
  isPending: false,
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ ...state, refetch: vi.fn() }),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    auth: { me: { useQuery: () => ({ data: null, isPending: false }) } },
    interpretation: {
      chartPage: { useMutation: () => ({ mutateAsync: vi.fn() }) },
    },
  },
}));
describe("Chart page placement boxes", () => {
  it("renders each mini paragraph in its own placement box, with expandable evidence", async () => {
    const chart = await calculateChart({
      location: "Dallas",
      latitude: 32.7767,
      longitude: -96.797,
      timezone: "America/Chicago",
      date: "1986-11-20",
      time: "10:06",
      readingScope: "natal",
    });
    state.data = {
      placements: [
        {
          name: "Sun",
          paragraph:
            "Sun-specific synthesized meaning from its actual calculated mansion and conditions.",
          evidence: [
            {
              id: "sun",
              layerId: "elemental-decans",
              value: {
                judgment: "The elemental-family ruler modifies this Sun.",
                sources: ["Elemental policy"],
              },
            },
          ],
        },
      ],
    };
    const html = renderToStaticMarkup(
      React.createElement(SystematicDeconstruction, { chart })
    );
    expect(html).toContain("Sun-specific synthesized meaning");
    expect(html).toContain("Why this reading");
    expect(html).toContain("North Node");
    expect(html).toContain("Descendant");
    expect(html).toContain("Preparing Moon");
    state.data = undefined;
    state.error = new Error("AI provider unavailable");
    const failure = renderToStaticMarkup(
      React.createElement(SystematicDeconstruction, { chart })
    );
    expect(failure).toContain('role="alert"');
    expect(failure).toContain("Retry summaries");
    expect(failure).not.toContain("Sun-specific synthesized meaning");
  });
});
