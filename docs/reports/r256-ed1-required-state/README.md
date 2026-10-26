# R-01 ED I required initial state

Review baseline 0ff6f92f0077aec3fc41110ca5a0ef935da5e9b8. Product 36bf9aa8e765554759d67ac62a224133236b27e7. The only product change is ed1Requested: any selected CB_ELEMENT_DISCHARGE_1 now requires the existing resource contract, irrespective of Rapid Morph level or optional UI fields. No engine, coefficient, source gate or comparison policy changes. Unsupported enhanced-phial/axe-boost/multi-technique cases remain explicitly unavailable rather than falling back to a body total.

Reused real MHDB147 fixture from r254-cb-rapid-morph/fixture.json. Normal phial, shield ON, axe OFF, Rapid Morph Lv0, no decorations. Actual UI → calcBuild → renderer; no computed-result override.

| Case | Both channels |
|---|---|
| A previousAction/normalPhials blank | REAL_SLICE:CB_ED1_START_STATE_UNRESOLVED; no numeric result |
| B CHARGE / 1 | available162.82999999999998; complete; stock0; previousAction CB_ELEMENT_DISCHARGE_1 |
| C CHARGE / 0 | REAL_SLICE:CB_ED1_PHIAL_STOCK_INSUFFICIENT; unavailable; no components; stock0 retained |

Before fix A was available162.83, finalState{}, DOM 選択技の実計算162.8, also numerical saved comparison. Thus provisional/source annotation did not distinguish untracked state. before.json records this failing counterexample.

Actual saveNamedBuild/runBuildCompare checked both saved builds under each of the three shared starting conditions: channels/reasons equal standalone; before/after equipment snapshot, conditions, summary and results restored. preserveCombo:true intentionally shares starting conditions, so this same-equipment fixture does not create a one-sided state failure; do not claim partial-failure isolation tested here. No new failure fixture invented.

initial-assert-context.json preserves a harness assertion error: it compared comparisonContext metadata as if standalone and comparison objects must be entirely identical. Corrected assertion compares channels/reason while retaining full before/after restoration assertion. Product numeric expectations unchanged. after.json is successful evidence; executed on baseline working tree, exact index/adapter/bundle hashes checked against product commit. Old r255 evidence retained, old missing-state compatibility claim superseded.

Bundle exact source inclusion checked for all8 modules, adapter loads externally; bundle unchanged. No broad regression, CI or Safari execution. This change deliberately withdraws prior untracked ED I calculation; legacy inputs must now supply supported initial state. It does not complete arbitrary CB combos or enhanced-phial consumption ordering.
