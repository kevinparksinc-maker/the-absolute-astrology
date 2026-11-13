# My Chart: independent method outcomes, then synthesis

The My Chart page now displays every registered base method and its own finding-specific judgments before the whole-chart narrative. Combined mode displays a second, separate event-method formation. There is no truncation of method findings for display.

`buildChartMethodOutcomes` consumes the verified reading bridge and exposes each method's calculation technique/version, prerequisites, calculated records, own judgments, rule/source references, evidence IDs and limitations. This path makes no AI request. The narrator receives the same `findingJudgments`, including their stable finding IDs. Both reading screens now pass the displayed chart into the synthesis route so that matching positions, horizon, houses and snapshot identity are checked before narration.

The planetary placement-card generator is no longer the My Chart page's primary content. Divisional charts, Dasha and BAV/SAV visuals appear under their owning method. The whole-chart narrative follows the method outcomes. The selected reading mode is passed explicitly to both consumers.

## Current formation

There are now 18 registered base layers: the original 16 plus numerical Shadbala and Bhava Bala. In natal mode, the transit activation layer is not applicable. Historical Chinese Xiu remains reference-only. Those are explicit outcomes/statuses, not computed personal interpretations. Combined mode evaluates the independent event registry as well.

Numerical Shadbala and Bhava Bala are now calculated in `vedic/strength.ts`, with six planetary limbs and twelve house totals. Their independent outcomes, component charts, sources and selected formula variants are shown with the other methods. BAV/SAV remain separate support measures. The older angularity/occupancy panels have not been reinstated as substitutes.

## Validation

- TypeScript check passed.
- Regression tests verify all registered method identities, exact agreement between displayed and narrator finding judgments, separate event evidence, and rejection of altered chart positions.
- The connected-narrative tests verify per-method contributions and prevent detached or invented finding references.

## Deployment state

The previous synthesis fix is committed locally as cd98bb6. Its production push was rejected by automatic approval review. These My Chart changes are additional local work; they must not be described as live until publication is authorized and verified.

A real hosted model response is not certified by mocked-provider tests. Groq is the configured live provider. Its account/request limits still require verification with the full synthesis packet; this report does not claim the full packet fits the current account allowance.
