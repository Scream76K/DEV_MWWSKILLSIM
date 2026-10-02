# Spec alignment audit — v7.2.2-spec-recovery-r2

Reference evidence: `v7.2.1_SAVE_SUPPORT_ROOTSAFE` was used only for the previously working UI/behavior regions. The current source remains the implementation base.

## Regression findings and corrections

1. **Affinity** — restored the adopted Artia canonical great-sword base and added deterministic affinity regression guards. Bow BOW_01 unconditional Artia base affinity fixture = 18% before skill affinity; great-sword attack-mutation fixture = 8%. Existing current calculation/data remains otherwise intact.
2. **Talisman UI** — restored the compact `charm-skill-editor` layout from the known-good reference. Preserved the newer skill type metadata. Rendering no longer erases user talisman state merely because the local generation rule rejects it.
3. **Save vs Compare** — Step ⑤ is save-only. Comparison is removed from Step ⑤.
4. **Monster/Compare support location** — the support divider precedes Step ⑥. Step ⑥ contains target monster/body-part and build comparison. Combo is Step ⑦; proposal is Step ⑧.

## UI invariants (regression gates)

- Steps ①–⑤ are the equipment/create-and-record flow.
- `ここからサポート機能` MUST occur after Step ⑤ and before Step ⑥.
- Step ⑤ MUST NOT contain `compareBuilds`, `runCompare`, `monster`, or `monsterPart`.
- Step ⑥ MUST contain monster/body-part and build comparison controls.
- Step ⑦ is Combo DPS.
- Talisman skill rows MUST use the compact `charm-skill-editor` structure.
- `renderCharmEditor()` MUST NOT clear skill/slot state as a side effect of rendering.

## Important boundary

The reference ZIP was not copied wholesale. OCR, current databases, current Combo/Technique implementation and unrelated current-source code were retained.
