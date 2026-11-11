# Current standard skill audit

Product baseline: d137760b858774aeb56e1c6a6baabb34370bd95a. This audit does not change any damage coefficient, skill adoption, product guard, saved build, or target identifier.

## Confirmed audit defect

The historical catalog scanner recorded ignoredSkillEffects but omitted unappliedEffects. Current LBG rapid First/Force (137/140) can return available damage while explicitly marking those effects NOT_APPLIED. Consequently the old audit output can omit a known partial result. Available damage must not be read as proof that every skill effect is implemented.

The revised audit keeps whole-effect omissions, partially retained components, rapid unapplied effects, owner exclusions and annotation-only extra damage separate for each channel. It records the selected standard route rather than relying on potentially explicit fixture moves. Historical evidence remains unchanged.

The initial twelve-case smoke also exposed a pre-existing rank-probe problem: adding a requested charm rank on top of a weapon's inherent First/Force skill can test a higher total level. The audit must preserve the weapon and adjust only its synthetic charm contribution against the no-charm baseline. If an inherent rank exceeds the requested rank, the requested case is unreachable in that representative and must be recorded as such rather than stripping the source skill or claiming coverage.

## Scope and provenance

The planned current-standard refresh uses thirteen weapon kinds and fourteen route representatives: CB is static-only, LBG rapid783 and nonrapid773 are separate profiles, and HBG469 uses the current ten-discharge standard. Other kinds retain the existing source representatives. This is not the historical all-fourteen-kind scan even if the number of cases happens to match.

The source pack contains179 skills /442 valid ranks. Its API data version is2026-04-15T01:28:18+00:00, retrieved2026-11-05T02:32:05.085Z. Its referenceGameVersion is NOT_ESTABLISHED_BY_API_IMPORT_VERSION. Individual rank probes use a custom charm mapping or actual set pieces; they are not proof that every resulting full equipment combination is legal. Empty omission arrays are not universal skill-completion certification.

## Specification reconciliation

- The Nov10 ledger's144 omitted observations and13 skill IDs belong to its recorded runtime hashes and representative conditions, not automatically to the current product.
- Earlier r263 complete/partial classifications describe adopted scope. Water181's selected LS/Bow element scope, Cornpopper159's limited shell actions and Airborne86's per-technique scope do not become universally implemented merely because one route is connected.
- Current Thunder165 validates resistance provenance, component scope and cap. Standard-channel deferral preserves calculable normal results without inventing maximum applicability.
- Charge Master24's confirmed charged techniques and narrow no-effect cases remain distinct. No blanket declaration that every other motion or ammo has zero effect is justified by the reviewed sources.
- Global owner exclusions8/85/103/129/138/160 and standard-only163 remain unchanged. Historical proposals are not new authorization.

Independent read-only review found no new common product formula defect that justified widening these scopes. The current visible omission formatter already separates normal/maximum and preserves GL162 body affinity while disclosing the unsupported shell interaction.

## Verification status

Refresh completed:6188 requested-rank cases calculated across13 weapon kinds/14 profiles, with no rank mismatch, execution failure or missing fixture. Of12376 channels,1010 explicitly remain partial and11366 have no recorded unsupported omission (not universal completeness). All46 loaded local script hashes were unchanged.

Rapid783 inherently carries Force Shot1:884 of the1010 partial channels are in that profile, including390 additional ignored-effect observations from its existing combination guard. Total omission records are516 ignored/partially-retained entries and890 rapid unapplied entries; these are overlapping observations, not1406 failed calculations. See [condition matrix](OBSERVED_PARTIAL_EFFECTS.md) and [machine-readable summary](summary.json).

Seven new audit unit tests passed after observed red/green, with312 bounded regression tests passing. Independent review found no blocker. The two scan halves cover disjoint profiles and all442 ranks; the12-case smoke verifies that rapid omissions are captured while ordinary First/Force remain calculable, and requested ranks are not inflated by weapon inherent skills.

The next narrow candidates are rapid142 Latent Power and154 Peak Performance. Their existing nonrapid affinity/attack producers are connected, while rapid guard413 rejects the combinations. This report does not approve or implement a widened rapid skill scope. Any follow-up must validate identity/rank, resolved activation plan, all25 contacts, independent channel arithmetic and negative interactions;137/140 omissions remain separate. No full repository/integration suite or CB runtime audit is authorized by this report. No new game-version accuracy claim follows from this audit.
