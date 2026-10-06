# Technique DB Expansion Phase 2 — r48

Project baseline: Ver.1.042.00.02. Based on r47; baseline version is unchanged.

| Weapon | r47 | r48 | Added |
|---|---:|---:|---:|
| Dual Blades | 1 | 22 | 21 |
| Hammer | 4 | 28 | 24 |
| Hunting Horn | 5 | 59 | 54 |
| Lance | 4 | 32 | 28 |
| Other weapons | 143 | 143 | 0 |
| Total | 157 | 284 | 127 |

Counts include normal/state variants, special identities, and unresolved entries. Source cataloguing now covers the referenced tables for 7 weapons. It does not mean all game techniques are verified. All `complete` flags remain false; all 127 new records remain `EVIDENCE_GATED` pending baseline audit and component/state validation. No new combo-picker entries or calculation-ready claims are made.

## Material behavior change

**Dual Blades STANDARD now fails closed.** The source's Demon Dance main table and Ver.1.020.00 history disagree on hit-by-hit element modifiers. The existing 27-hit/MV393 numerical record remains preserved; revision 3 records the alternate history modifiers, source reference, and unresolved conflict. It is now UNVERIFIED rather than silently treated as calculable.

`genericStandardProfileAvailability` evaluates canonical profile hits before returning READY. A gated technique returns EVIDENCE_GATED. Damage calculations reject the gated Demon Dance record. The other existing generic STANDARD calculations match r46 golden outputs for NORMAL and MAX conditions. This is deliberate evidence gating, not an adopted replacement modifier value.

## Registration rules

- Dual Blades multi-hit values and per-hit element modifiers are expanded. The source has no part-modifier column, so new records omit `partModifier` and retain `PART_MODIFIER_NOT_REPORTED_IN_SOURCE`; no value of 1 is invented.
- Screw Slicer retains table/history element disagreement as a conflict.
- Hammer's eight-hit spinning attack and multi-hit finishers preserve each modifier and stun value. Jump charged attacks retain conflicting table/history MV values. Charged-slam histories include both documented revisions rather than choosing an intermediate old value.
- Hunting Horn normal/just performance beats and encore variants have separate identities. Bracketed waves retain `specialSourceValues` and zero normal hits. Element/status wave rows expand to named identities; their coefficients are not treated as ordinary MV or an inferred elemental formula. Formula/handler/state checks remain pending. Focus Resonance has no supplied values and stays unresolved.
- Lance dash and mounted dash retain known per-hit values with unknown hit count in `variableHitSource`; a one-hit assumption is not made. Existing triple-thrust STANDARD retains the previously adopted change-history values.

Numerical facts, source differences, and revision metadata remain inside Technique DB. Handlers and profiles receive no new numerical tables. R47 metadata constant names remain for compatibility; their dictionaries now include Phase 2 records. The new audit registry applies verification changes at the same canonical merge boundary.

## Evidence

Author measurement pages retrieved 2026-10-06 Japan time:

- https://macarongamemo.com/entry/mhwilds-dual_blades-motion
- https://macarongamemo.com/entry/mhwilds-hammer-motion
- https://macarongamemo.com/entry/mhwilds-hunting_horn-motion
- https://macarongamemo.com/entry/mhwilds-lance-motion

The linked authors' measurements are numerical evidence, not official patch specifications. Official baseline-version audit remains pending. Evidence registry includes URLs, source update dates, retrieval dates, and table/history locators.

## Validation

Run `node --test tests/*.test.cjs` from the package directory.

20 tests pass, no skipped tests. Five embedded engine Self Tests pass. Tests cover all 237 newly added records' gated reads, source identity and data boundaries, bracketed versus normal hits, variable hit counts, omitted source fields, immutable inherited hits, inline JavaScript syntax, and the new Dual Blades availability/calculation gate. R46 golden regression data is included, with Dual Blades explicitly expected to be blocked.

Browser layout and interaction testing remains uncompleted because a browser executable was unavailable. Existing UI and dedicated handlers are retained. Deploy the root `index.html` as before.

## Remaining work

Expand Switch Axe, Charge Blade, Insect Glaive, Gunlance, Bow, LBG, and HBG; resolve source contradictions and audit official updates before promoting new techniques. Full DB completion, STANDARD readiness, and Build Comparison readiness remain separate.
