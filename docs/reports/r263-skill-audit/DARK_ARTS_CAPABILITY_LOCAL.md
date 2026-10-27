# Stage3 post-checkpoint local batch
Base: b2c590d3057c80b23927bcec3d8b3c1713f702bc. Uncommitted; no push.

## Expected and actual
- Dark Arts existing 1.2/1.14 remains in multiplier decomposition, ordinary/conditional flat remains additive, then adopted element cap. GS base100 ×1.2 ×1.3 ×1.2 +60 +200 =447.2; normal180. Adding adopted absorption120 produces567.2 capped500. Public per-component details assert these values.
- Same GS3 technique route: normal405.43 remains unchanged; red-gauge maximum524.67. With Peak5, full-health603.02 wins the whole-route comparison; red and full effects are not combined. The original normal channel/condition key are preserved. If either branch lacks a complete value, original maximum stays unresolved.
- LS producer uses1.14 (combined multiplier1.368), static/shared-path check, not LS runtime validation.
- Dark multiplier has body componentIds only, excludes generated SA followups and special components. Existing GS wave eligibility/coefficients and legacy wave path are unchanged; this batch generates no wave/additional damage. No new rank2/Black Knight adoption.
- IDs5/44/65/79/116 exact name/id/Lv1 permit unused capability for bow NONE/POWER/CLOSE_RANGE. NONE with all5 produces identical normal/maximum values to no skills. POISON remains rejected. No status accumulation becomes HP damage.

## Implementation/evidence
index.html: standardPowerConditionPlan maximumElementComponents (removes obsolete multiplier/flat stacking gates).
hope-hammer-browser-adapter.js: explicit body-only Dark Arts multiplier; evaluateCurrentSingleHealth plus whole-route evaluateCurrent health selection; resolveSkillApplicability capability-only handling.
Bundle generator executed: no bundle diff, because modified browser adapter/index are separate scripts.
Before: dark-arts-capability-before.json (checkpoint product, both maximums incomplete); coating-capability-before.json (checkpoint adapter replay, current index; unused entry blocked).
After: dark-arts-capability-after.json, coating-capability-after.json. Assertions in tools/skill-dark-arts-capability-proof.cjs and tools/skill-coating-capability-proof.cjs.
Related existing element-cap proof passes: dark-cap-related-after.json. No broad regression.

## Limits
No Safari, real game, CI, saved A/B UI or all-weapon runtime validation in this batch. Health whole-route comparison is reused from the existing adopted policy, not a new health simulation. Remaining full-channel unknowns are not treated as zero. Five capabilities remain partial because selecting unadopted coatings is not implemented. Dark Arts remains partial: rank2/action and broader special-component adoption remain outside this change. Original Stage3 checkout/storage/server untouched.
Latest classifications: {"火力非対象": 87, "部分接続": 60, "完全接続": 5, "固定ダメージ系・注釈のみ": 6, "欠落": 21}
