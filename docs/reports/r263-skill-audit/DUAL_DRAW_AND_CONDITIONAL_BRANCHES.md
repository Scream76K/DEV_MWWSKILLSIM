# Pass25: separate draw targets
Local only. Base b2c590d3057c80b23927bcec3d8b3c1713f702bc. Stage3 incomplete.

Expected/verified: distinct Critical Draw indices 0/9 and Punishing Draw index1. Both channels complete, physical +7 only on Punishing target; element changes only on Critical targets. Adopted bow arrow counts are 3/5/6, correcting earlier prose 4/4/6. Ordinary snapshot load restores both maps; preserveCombo retains current shared map; comparison snapshot includes separate map. Missing Punishing map stays incomplete. Initial test failed on cross-realm array prototype assertion; JSON normalization fixed test only.

Routes: explicitAffinityState/restoreExplicitAffinityState → buildSnapshot/applyBuildSnapshot/compareStep5Snapshot → referencePunishingAdds → bow/normal ammo hitAttackAdds or elemental contact hitAttackAdd. Physical-only flat; no special phial/shell/sound targets added. Ordinary body retains component-scoped L3 effect. Unsupported special references remain diagnosed.

Static conditional audit: standardGroupPowerPlan ~7060, standardPowerConditionPlan ~7710, calcMaxAffinity, resistance producer ~2006.
- 10 ヌシの誇り/激励: maximum +10 ally-preactivated; normal inactive. Parent-name conditional pending exemption remains missing.
- 131 ヌシの魂/根性【果敢】: BEFORE base×1.05, AFTER×1 in both channels. Consumed resistance/conversion blocked; parent-name pending exemption also unresolved.
- 150 毛皮の昂揚/不屈: maximum explicit count0..2; flat stacking remains FORTIFY_FLAT_STACKING_ORDER_PENDING. Normal active-faint model not adopted.
- 155 ヌシの憤激/死中に活: maximum +10 status-active, normal inactive. Parent-name pending exemption remains missing.
- 115 兇爪竜の力: highest rank8/18 maximum flat with Burst active; rank deduplication present, no Burst yields0. Normal-active Burst state model not adopted.
- 138 研鑽: explicit stage0..3 gives maximum0/4/8/12; normal unchanged. Same elapsed state interpretation needs alignment.
- 153 波衣竜の守護: conditional resistance producer explicitly rejects153; veil resistance→conversion remains disconnected.
- 162 海竜の渦雷: rank validation and annotation-only extra damage retained; maximum affinity+15 exists, normal active-state input absent.
- 173 オメガレゾナンス: display maximum affinity+20 exists; conditional producer remains pending. Near/far attack/affinity phase and rank capability mapping unresolved; no simultaneous phase assumption.

No new coefficients/state models adopted. Isolated JSDOM only, not Safari or real equipment. No CI, broad regression, commit/push. Existing before/after evidence retained. A documentation-generation Python command failed before writing due interpreter encoding; Node used for local documentation generation.
