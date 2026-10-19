# KAN-47 接続修復（未完了）

原本: /Users/scream/.codex/worktrees/kan108-r250-bow-producer/DEV_MWWSKILLSIM
HEAD: 4f6b20e89cf894ec414e49c198d68fc7826ccc4a。確認時 origin/develop: 8ba21ea9915e44421e89ae0a33fc7a4c5adcb1ae。Git書込み・公開なし。

## 修復した接続
- 採用弓の固定射撃・剛射・剛連射で、属性やられ耐性49／弾導強化53／回避性能77／破壊王129が全体を停止しないよう適用範囲を限定。破壊王を全域非火力扱いにしていない。既存MHDBのID・rank検証は維持。
- 散弾・剛射強化2、通常弾・通常矢強化6を既存bowReferenceSkills→BowReferenceの技別物理補正式へ接続。新係数なし。
- generic STANDARDで認証済み黒蝕一体Ⅰ(106/r267)を既存calcMaxAffinityの結果へ接続。新たな会心加算なし。Ⅱは保留。

## 使用できた操作
保存MHDB public-mhdb-20261013.tar.gzを通常HTTPデータ取得経路へ供給し、Playwright Chromium実画面でテンプレート読込→計算→保存→比較→個別復元。
さらだ弓⑤の元装備Aとアーティア復元を変更したBについて通常・最大STANDARDが算出され、各行の値・装備signatureと個別復元が一致。コンボ未登録でも成立。比較条件は共通の対象13/部位2700、強撃ビン、開始射撃3。異なる条件を各行へ個別保存する保証はこの確認に含まない。
観測値（固定期待値ではない）: A通常678.0794714031001、最大881.1868760175003。B通常671.5753694612627、最大873.1265631318754。
根拠: ab-restore.json。剛射・剛連射のtraceに既存1.05補正、通常射撃に1を確認。
ハンマーは元テンプレートがアーティア属性値の保留で停止。ホープ実武器とゴア実防具2部位に切替えた限定経路で黒蝕ⅠがSTANDARDへ入り、最大会心が二重加算されないことを確認（hammer-branch.json）。元テンプレート完成の証明ではない。
既存group-power-dom関連確認は成功。全件回帰なし。iPhone/Safari実機未確認。
独立レビューeisen一名: 最終差分に重大な見落としなし。読み取りレビュー。

## 残る阻害要因
- こたつ弓: 属性やられ耐性の誤停止の次に、属性変換152/r400で保留。保存MHDBの説明だけではLv別龍属性加算、追加龍ダメージ式・蓄積閾値・発生回数・持続/再発動・相互作用を確定できない。無視・除外変更・推測値投入はしていない。
- 元ハンマーテンプレート: ELEMENT_ARTIA_THREE_PART_BONUS_PENDING。基礎属性値が未確定。
- 1Hitの旧bonusDamagePendingReason経路は残り、黒蝕Ⅰ/根性の未対応表示は未修復。固定STANDARDの成功と混同しない。
- 全採用効果の完了条件は未達。採用弓のseries入口には10/62/70/115/155/157/167、106/r268、178/r442の未接続が残る。10/115/155にはgeneric側の既存式があるが、弓の発動状態・重複加算・組合せ確認なしに無条件転用しない。ordinary側も属性変換など未接続が残り、全網羅完了とは報告しない。
- 既存数値の出典確認と実ゲーム版での実測検証は別。VERIFIEDへの昇格なし。

重大な未定義数値を推測しないという依頼に従い、この限定修復で停止。source-sha.jsonに修正後原本SHA、before/に変更前原本と再現結果を保存。

## Follow-up repair: group/series connection

This section supersedes the earlier statement that parents 10/115/155 are unconnected. They are now connected; other previously listed blockers remain.

Only bow-adopted-power.js changed in this follow-up: bowAdoptedRoute, new bowAdoptedBonusPlan, bowAdoptedScenarioResult, bowAdoptedStandardPower, bowAdoptedComboContext and condition labels. index.html is unchanged. Shared standardGroupPowerPlan remains the coefficient source. Guts multiplies the base once; group/series flats are added once afterward. Encouragement and Resuscitate are inactive normally and active in maximum. Resuscitate's ailment is separate from frenzy recovery. Required missing/invalid manual scenario states remain blocked. Burst Boost uses the existing maintained-five-hit state in both channels, and contributes zero without Burst. Only one eligible rank applies. Divine Blessing 122 on real armor is non-applicable to this outgoing snapshot, with rank validation retained.

Real UI, recorded MHDB through the production loader, using SALADA_BOW_05 as the starting equipment: Encouragement group10 + head114/waist122; Resuscitate group155 + head237/waist155; Burst I series115 + head349; Burst II series115 + head349/arms351/waist352. Tested state differences, no-Burst state, one application per effect, normal/maximum, two saved A/B pairs and individual restoration. Common comparison conditions. See groups-result.json. No fixed damage expectations or full regression. Before module rejected the same Encouragement equipment; groups-before.json.

Same reviewer eisen: no blockers after distinguishing potentialAttackFlat from actual attackFlat. Standalone Guts route was not broadened. Reviewer messages remain in this thread.

1Hit remains blocked: compareStep5Snapshot uses hidden dMV (default 100), and damageForStats receives no technique ID. Existing bow skill/coating rules depend on TechniqueDB/BowReference technique IDs, so a fixed-three-shot formula cannot safely be substituted for arbitrary-MV 1Hit. No guard-only removal.

Known-source check only: recorded MHDB skill152/ranks398-400 descriptions and existing ARTIA_ELEMENT_SOURCE_DB, artiaSourceElement, artiaFixedVariantStats. Convert Element quantitative parameters are absent from those descriptions; hammer.threePartBonus remains null. Three same-element attack parts are already fixed in code; the missing item is a numeric bonus, not a user setting. No usable approved provisional value identified within this limited scope. No full-history/full-DB/external-source research. Required information: Convert Element level-specific dragon increase and additional-hit activation/formula, plus hammer three-part element bonus.

No Git writes or publication. Current hashes: source-sha.json. Before source: before-groups/bow-adopted-power.js.

## 2026-10-19: One-hit feature retirement

Implemented in index.html in this turn; not implemented before this turn. Changed groupProposalEvaluate, groupProposalRenderCandidate, compareSnapshot, comparisonReadinessHtml, renderCompareTableChunk, renderCompareTable, createBuildComparisonReport. Removed unused showDamage renderer. Removed one-hit UI, readiness reason, result-level damage/damageReason fields and proposal/comparison calls to damageForStats. Shared helpers, STANDARD damage and combo damage retained. Before snapshot: before-onehit/index.html.

Limited verification: onehit-probe.cjs / onehit-result.json passed. Loaded/saved/compared KOTATU_BOW_01 and SALADA_BOW_05. Saved SALADA A/B after changing one Artia restoration slot, compared and restored both. Restored KOTATU. SALADA normal/maximum: A 678.0794714031001 / 881.1868760175003; B 671.5753694612627 / 873.1265631318754. Values matched across comparison and restoration. No one-hit label or result-level damage fields. Proposal evaluator/renderer invoked with real current equipment: zero calls to retired one-hit helper. Full proposal search/apply and full regression not run.

Convert Element Lv3: NOT IMPLEMENTED, BLOCKED. +180 dragon displayed element is documented, but order relative to Dragon Attack, Charge Master and Declaration multipliers remains unconfirmed. Owner instruction requires reporting this rather than inventing an order. No proc damage or Lv1/2 extrapolation added. KOTATU remains BOW_SKILL_SCOPE_UNSUPPORTED:属性変換, normal/maximum STANDARD unavailable. Source evidence is not live-game verification.
- https://kuroyonhon.com/mhwilds/program/skill.php : Lv3 +180; no stacking order.
- https://www.reddit.com/r/MonsterHunterMeta/comments/1j89uve/i_did_some_testing_on_how_convert_element_and/ : author's dragon-weapon menu increase test; no multiplier stacking test confirmed.

Existing reviewer /root/eisen: no blocking findings in read-only before/after review; shared STANDARD/combo paths retained; Convert Element unchanged. This turn changed only index.html as product code. No Git writes or publication.
- SHA-256 index.html: f204deb01bdf972f61889d49fe2bdaba90bf1a3e072e19bd7573500ccc98d978
- SHA-256 bow-adopted-power.js: fe5596aa54ede8453a4d53a12b8dd3801ec7ad201b6c6e7daf5bcf3604517c8c

## 2026-10-19: Convert Element Lv3 order resolved for Dragon Attack

Supersedes the preceding complete-block status for the limited adopted bow route. Direct new evidence: https://mobalytics.gg/mhw/guides/convert-element-guide , Ralph Suntide Sun, 2025-03-28, Other Notes and Findings. Author reports own testing and explicitly states Dragon Attack does not boost the element-stat increase from Convert Element. Thus use +180 after Dragon Attack, not (weaponBase+180)*DragonAttackMultiplier. Source report only; game version unspecified, no live-game verification. Previously read kuro/Reddit articles were not reread.

Changes: bowConvertElementPlan, bowAdoptedScenarioResult, bowAdoptedStandardPower, bowAdoptedComboContext, renderBowAdoptedPowerSummary; comparisonReasonText and comparisonReadinessHtml in index. Exact skill152/rank400/Lv3 only. Normal inactive, maximum active; only dragon weapon gets +180. Receipt stores source/date/order/provisional status. Proc damage excluded in effectPolicy and UI. CM, active Declaration and other unconfirmed multipliers remain blocked; no extrapolation to Lv1/2. Conservative cap guard uses documented older threshold max(base+350,base*1.9), sourced at https://kuroyonhon.com/mhwilds/memo/31.php; values above this remain pending rather than adopting a cap/rounding order or target version. This guard is intentionally narrower than later game caps. Other pending routes unchanged.

Verification: convert-probe.cjs / convert-result.json PASS. Actual template load/save/compare/restore for KOTATU_BOW_01 and SALADA_BOW_05 A/B. KOTATU normal=645.5510402250001, maximum=937.3348726950003; displayed element receipt 412 to 592 (flat +180 once, normal +0). SALADA A/B exact equality with preceding onehit-result.json. Lv2 rejected, missing explicit activation rejected, CM combination pending. Proposal still makes zero one-hit calls. No one-hit UI/export revival. Final metadata-only extraction of cap constants checked with node --check; numeric behavior unchanged.

Same independent reviewer /root/eisen: no blocking findings; code review only, no writes/tests. No full regression, new agents, Git writes or publication. Backup before-convert retains preceding source.
- SHA-256 index.html: 2e509d4c6560b0012fed675bcec3dd33c2af9182a59ad168581cc8e6b2d47300
- SHA-256 bow-adopted-power.js: 0eaa5ba5897137ecc49d0c79857c224967f012b4f36a305cfdaeb3a1e56de133

## 2026-10-19: Next four effects, read-only findings / approval blocked

Existing convert-result.json report.results already contains KOTATU_BOW_01, SALADA_BOW_05 and SALADA_BOW_05_B in one saved comparison. Each has normal/maximum equipment receipts. This satisfies the requested KOTATU-vs-SALADA pair; reused without rerunning comparison or numeric reconciliation.

MHDB official fixture: parent70 rank171/172 (Powerhouse I/II) explicitly +10/+25 base attack after successful Power Clash or Offset. Parent157 rank412 (Satsui no Hado) modifies special actions. Parent167 rank424 (Seregios's Evasion I) changes Adrenaline Rush duration, not amount; rank425 also adds attack and remains separate. Existing HP policy includes all three parents, but standardGroupPowerPlan has no handlers and adopted bow rejects these ranks. No Akuma special actions are in the existing fixed weapon STANDARD profiles. Arbitrary combo routes must retain their existing gate.

Concrete proposed changes, NOT APPLIED: standardGroupPowerPlan resolves exact 70 ranks using MHDB amount validation for preactivated maximum only; resolves157/412 and167/424 as zero magnitude on fixed weapon STANDARD with explicit scope. standardPowerConditionPlan clears only the corresponding resolved parent/rank pending flag. bowAdoptedRoute/bowAdoptedBonusPlan/bowAdoptedScenarioResult and normal/max constructors get exact-rank support; Powerhouse requires explicit inactive/active scenario, no assumed success frequency. comparisonReadinessHtml and renderBowAdoptedPowerSummary disclose activation/scope. No change to global HP policy or arbitrary combo gate.

Execution was rejected by automatic approval review BEFORE process creation: approval for these specific common-STANDARD/bow modifications was not recognized and impact was deemed broad. No implementation, backup or test script was created by the rejected command. Product SHA remains index 2e509d4c6560b0012fed675bcec3dd33c2af9182a59ad168581cc8e6b2d47300 / bow 0eaa5ba5897137ecc49d0c79857c224967f012b4f36a305cfdaeb3a1e56de133. User approval of this concrete scope is needed to proceed.

Scope of preceding completed work: Convert Element Lv3 is adopted-bow-only, not a common all-weapon implementation. Earlier bow bonus bridging is bow-only; shared standardGroupPowerPlan remains a distinct producer, and arbitrary combo gates remain separate. Known unresolved adopted effects (not a new exhaustive audit): Powerhouse I/II, Satsui special actions, Seregios Evasion I duration and II attack/duration; Binding Counter I/II, Black Eclipse II, Declaration II; Declaration I and Convert Element on other routes, plus Convert Element with unconfirmed multipliers/caps.

Existing reviewer /root/eisen reviewed the unapplied proposal only: structurally compatible; Powerhouse maximum must be explicitly a preactivated hypothetical snapshot, not a weapon-achievable maximum (bow activation/weapon-swap persistence unconfirmed). Missing scenario state must remain pending. Resolve pending flags only by authenticated exact rank and scope. Satsui/Seregios I are no-modifier decisions for that fixed route, not full implementations. Arbitrary combos and Seregios II remain pending. Review does not override the execution rejection.

## 2026-10-19: Narrow fixed STANDARD scope repair completed

PM narrowed scope excludes Powerhouse entirely. One formal resubmission approved and applied. Only exact validated parent157/rank412 (Satsui) and parent167/rank424 (Seregios Evasion I) are resolved as +0 in fixed weapon STANDARD, with explicit no-special-action/no-duration scopes. Global HP policy, free-combo gate, Seregios II and Powerhouse unchanged.

Changed functions: index.html standardGroupPowerPlan, standardPowerConditionPlan, comparisonReadinessHtml; bow-adopted-power.js bowAdoptedRoute, bowAdoptedBonusPlan, bowAdoptedScenarioResult. Common STANDARD gets route-local handling; adopted bow fixed three-shot producer uses the same plan. This is not a universal all-weapon/free-combo implementation. Prior Convert Element Lv3 remains adopted-bow-only.

Evidence: before-fixed-scope/ original files; fixed-scope-probe.cjs and fixed-scope-result.json. Limited actual UI: SALADA05 with group157 + armor head588/arms590; SALADA05 with series167 + arms596. Both normal/maximum calculated, saved together, compared, restored with identical snapshots and normal result. Common great-sword STANDARD branch compared against identical stats without each effect: both normal and maximum unchanged. Arbitrary combo gate remains pending; rank425 remains blocked. No all-weapon regression. Prior KOTATU-vs-SALADA comparison reused from convert-result.json, not repeated.

Same reviewer /root/eisen read-only diff review: no blocking findings; exact rank/scope gating preserved, no edits/tests/delegation. No Git writes/publication.

Known remaining adopted-effect gaps (not exhaustive): Powerhouse I/II; Satsui special actions; Seregios I duration and II attack/time; Binding Counter I/II, Black Eclipse II, Declaration II; other routes for Declaration I/Convert Element, and unconfirmed Convert Element multiplier/cap interactions.
- SHA-256 index.html: ec5dda5262ce9583e7c13c29b92917cc13ae36f871fd3e07ab3e2d301bb13e63
- SHA-256 bow-adopted-power.js: 5ad162dbeab85fab6e9cd21fa6c8a4c1a9a4d5813f6f367e0413612953479008

## 2026-10-19: Combined priority task - UI completed, effect batch rejected

Priority1 NOT APPLIED: the proposed batch for scoped GS Powerhouse, Binding Counter, bow Declaration II, and generic GS Convert Element was rejected BEFORE process creation. No script/backup/product mutation occurred from that rejected command. No alternate operation or retry of effect changes was made. Independent UI changes were submitted separately and approved.

Exact approval rejection:
> This batch performs broad unapproved changes beyond the latest scope, including adding unrelated skills, generic Great Sword conversion, and an unsupported Lv2 coefficient (1.3/40), with substantial persistent code/UI mutations; the latest authorization only covered 1Hit removal and a narrowly evidenced Lv3 bow change.

Current investigation only (not adopted): https://lescarnetsdelawycademie.fr/set-skills-wilds/ documents Binding Counter +25/+50 after recovery and Declaration II +30%+40. Existing https://gamewith.jp/mhwilds/534856 also documents Declaration II. Powerhouse +10/+25 is in MHDB; https://kuroyonhon.com/mhwilds/memo/3.php confirms GS offset and Power Clash capability. This does not establish bow activation. Black Eclipse II wording (+10 with virus / +5 once cured) still needs interpretation of replacement versus additional amount. Seregios II +4% exists in source, but multiplier placement with existing flats remains unconfirmed. Generic GS Convert Element remains unimplemented because the batch was rejected; other-weapon transfer is not claimed. Hammer Artia threePartBonus remains missing; prior evidence reused, no renewed search. Unconfirmed cap and elemental-multiplier interactions remain pending.

Priorities2/3 APPLIED in index.html only. CSS stage6-ui-readability previously overrode #armorBuildWorkspace to one column; now restores 3fr:2fr. Phone-width equipment/deco controls minimum height44; right summary grid minmax(0,1fr), status rows wrap to keep values readable. The workspace itself stays two columns. Existing support/build layout not changed. renderCompareTableChunk passes detail:false only for dragon; icon/value and accessible aria-label remain unchanged. No calculation, state or JSON-format edits.

Evidence: before-mobile-ui/index.html; mobile-ui-probe.cjs; mobile-ui-result.json; workspace-375.png and workspace-390.png. Before at390: one column; after390: 218.390625/145.609375, after375: 209.390625/139.609375 (6:4). Tap/select actual armor and decoration edits succeeded. Visible enabled controls minimum44px verified. Workspace and document stay within viewport; pane decoration overflow remains about7-9px, numeric status now visible. Saved comparison dragon visible label removed, loaded dragon icon retained, numeric value retained, accessible label remains dragon + value. Chromium mobile/touch emulation only; WebKit unavailable, physical iPhone/Safari not tested. Old 28px decoration override and right status min-content overflow were found and corrected; only affected UI check repeated. KOTATU/SALADA power A/B evidence was not rerun.

No full regression, extra investigators, Git writes, publication or Jira operations. Same independent reviewer requested once for final UI diff.
- SHA-256 index.html: f748e5706d0750a0236a4a646d820f7fdecbdc665807df0f2ba9eec8307d3a43
- SHA-256 bow-adopted-power.js: 5ad162dbeab85fab6e9cd21fa6c8a4c1a9a4d5813f6f367e0413612953479008

Final reviewer /root/eisen: no blocking UI findings; confirmed no effect-calculation changes, no support/build50:50 changes, and no shared element renderer changes. Physical iPhone/Safari remains unverified. Read-only review only.

## 2026-10-19: Owner-approved Powerhouse / Binding Counter / elemental Declaration

Formal approval accepted the corrected minimal patch. Product files: index.html (standardGroupPowerPlan, standardPowerConditionPlan); bow-adopted-power.js (bowAdoptedRoute, bowDeclarationElement, bowAdoptedBonusPlan, bowAdoptedScenarioResult, bowAdoptedStandardPower, bowAdoptedComboContext, renderBowAdoptedPowerSummary). Previous rejected batch was not executed. No generic Convert Element expansion.

Powerhouse exact70/r171,172: +10/+25 only maximum, only great-sword STANDARD with successful offset/clash preactivated. Bow remains rejected. Binding Counter exact62/r152,153: +25/+50 only maximum, recovery from web/frost/grab preactivated; explicit bindingRecovery state and channel required in bow. Normal cannot gain the flat even with manually ACTIVE state. Common STANDARD retains its existing hypothetical maximum condition-plan semantics. Identity and equipment-count validation retained.

Declaration exact178/r441,442: owner's displayed-element multipliers1.2/1.3 and flats20/40. Physical attack unchanged. Bow-only existing producer extended to II; no all-weapon implementation claim. Existing I component order retained: weaponBase * normalMultiplier * declarationMultiplier + normalFlat + declarationFlat, then existing conditional element flats. No extra display/internal conversion; BowReference continues owning it. Here 'original' multiplier basis is weaponBase * normalMultiplier, excluding normalFlat under existing I's established order; this is not (entire displayed stat) * multiplier. II with Charge Master is pending; Convert Element with active Declaration retains pending gate. Other weapon routes and unknown interactions/caps are not newly established. No live-game verification claim.

Evidence: approved-effects.test.cjs, approved-effects-before.txt (4 expected missing-feature failures), approved-effects-after.txt (4 passing focused tests). approved-effects-browser.cjs / approved-effects-browser-result.json: real SALADA05-derived Binding I/II and Declaration I/II armor, normal/maximum, save each, two A/B comparisons, restore each with identical snapshot and both powers; Declaration physical attack compared to same producer without Declaration and unchanged. II+CM maximum pending, normal evaluated. Initial browser attempts exposed test setup issues (insufficient four-piece count; armor with already-unsupported Environmental Adaptation or Maximum Might; removed effect still present in test total) and were corrected only in test inputs. No extra unsupported-skill enablement.

Same reviewer /root/eisen performed one read-only final diff review: identified manual scenario.channel could override NORMAL combo. Corrected by assigning input.channel over supplied scenario.channel. approved-effects-channel.cjs / approved-effects-channel-result.json verifies an actual Binding II build, NORMAL combo plus manually MAXIMUM/ACTIVE scenario contributes0, actual MAXIMUM contributes50. This boundary-only check followed the one-line fix; the full saved comparison was not rerun. Other reviewer checks confirmed GS-only/rank/amounts, Declaration element-only and existing I order, pending interactions, and no UI change. No second review requested.

UI stage6-ui-readability compared byte-for-byte with before-approved-effects and unchanged. Saved dragon-label renderer also untouched by this patch. No full regression, new reviewer, Git writes or publication. Remote HEAD read failed because github.com DNS was unavailable; existing local origin/develop reference retained.
- SHA-256 index.html: b053e84b7697e4238ba880c18de524ce85b5f7b95f1fbc7e2b183a8e5898f35f
- SHA-256 bow-adopted-power.js: bfc21173cef8b85e36761f738643ebbf085c2673cb525f5af7a22895b53542aa

## 2026-10-19: Remaining effects - sourced repairs and specific pending decisions

Latest owner-authorized remaining-effects scope. New focused evidence:
- https://gamewith.jp/mhwilds/487101 : Black Eclipse II explanatory paragraph specifies infected +10, recovered additional +5, TOTAL +15. Resolves earlier abbreviated wording; source-confirmed, not live verified.
- https://gamewith.jp/mhwilds/489290 : hammer three same-element parts gives displayed +30, including status. Weapon examples have attack-only production/restoration and displayed350. Existing base320, independent mutation/restoration retained.
- https://gamewith.jp/mhwilds/534856 : explicit elemental order base*1.2*1.3+60+40 and examples for great-sword, hammer, dual blades, bow. Confirms existing I component order and cross-weapon body applicability, not CM/Convert interactions.
- https://gamewith.jp/mhwilds/505961 and /505963 : Seregios II approximate4-5% with repeated perfect dodge while Adrenaline Rush active. Existing https://lescarnetsdelawycademie.fr/set-skills-wilds/ says4%. Neither establishes exact multiplier basis/flat ordering; remains blocked, no inferred coefficient.
- Existing https://mobalytics.gg/mhw/guides/convert-element-guide : Dragon Attack does not scale Convert flat; no Charge Master or Declaration interaction measurement. No new combined-order claim. Existing missing kuro Artia table was not revisited.

Applied after formal approval: index.html ARTIA_ELEMENT_SOURCE_DB hammer.threePartBonus=30 with independent source metadata exposed by artiaSourceElement; standardGroupPowerPlan authenticates GoreII and generic DeclarationI/II; standardPowerConditionPlan connects recovered Gore15, shared Declaration element formula and guarded ConvertLv3; standardPowerSkillTotals keeps Convert instead of dropping it; standardPowerForStats preserves plan effectPolicy so excluded proc remains explicit at output. bow-adopted-power.js standardDeclarationElement and standardConvertElementPlan are single shared implementations with old bow wrappers; bowAdoptedBonusPlan/ScenarioResult supports GoreII and explicit NONE/INFECTED/OVERCOME 0/10/15 without duplicating frenzy affinity. Non-fire status Declaration contributes no HP element. Global HP policy, arbitrary combo gates and existing bow scope retained.

Generic Convert uses exact skill152/r400/Lv3, normal inactive/max preactivated, dragon +180 after Dragon Attack. No proc. CM, active Declaration, Dark Arts, Coalescence, Absorption and conservative cap guard stay pending. Generic Declaration excludes unknown conditional-multiplier combinations; no physical multiplier. This connects existing GenericWeaponHandler body STANDARD, not every special component/free combo route. SeregiosII and DeclarationII with CM/Convert remain unresolved and explicit, not silently excluded.

Evidence: remaining-effects.test.cjs; remaining-effects-before.txt (four expected failures), remaining-effects-after.txt (four pass). remaining-policy-before/after.txt verifies top-level PROC_DAMAGE exclusion fails then passes. remaining-effects-browser-result.json: real dragon hammers429/430 with Lv3 Convert A/B; real hammer429 DeclarationI/II; bow GoreI/II, six saves and three same-weapon pairs, normal/maximum identical after saved comparison and individual restoration. Explicit bow frenzy states add0/10/15. Comparison uses each pair's shared target conditions and equipment-derived sharpness. Initial test inputs incorrectly retained the last bow pair's physical hitzone / default sharpness; test corrected, production comparison unchanged.

Original KOTATU_HAM_01 Artia now has a known attribute value and single STANDARD computation succeeds, but saved comparison still blocks with WEAPON_SHARPNESS_PENDING:WEAPON_VARIANT_SELECTION_NOT_AUDITED. See remaining-effects-browser-incomplete.json (preserved original attempt). This pre-existing sharpness issue is not bypassed; the successful saved A/B proof uses real normal dragon hammers, not the original Artia template. Existing KOTATU bow/SALADA05 proof reused, not rerun.

UI6:4 readability CSS and renderCompareTableChunk match before-remaining-effects byte-for-byte. No full regression, Git writes, publication, additional investigator or new reviewer. Current model/reasoning setting is not exposed by the available execution metadata; not investigated.
- SHA-256 index.html: 8822cc01f6f0f50280867428d6fd0b9a77dd64c578fc46203cd57362c726191d
- SHA-256 bow-adopted-power.js: a4eb020bb03ddc62b691c467270d9d0c34133854648a60ad83197537294d16fb

## 2026-10-19: Final review correction and original hammer sharpness

Prior remaining-effects review by the same eisen identified ordinary Dark (darkLevel) missing from Convert Element's unknown-combination guard. Added darkLevel; remaining-dark-before.txt records the expected failure and remaining-dark-after.txt the single passing boundary. No repeated prior suite.

Original KOTATU_HAM_01 identity inspected: hammer1154 禁戒のデスヴァンケル, MHDB_FIXED_COMPLETE, attack production source1154 (element1156 / affinity1155 are distinct). Existing resolver blanket-blocked artia or artiaFixedVariants regardless of known selection. Base gauge contains white; final sharpness including sharp:EX restoration had no audited mapping. Identity was known, not ambiguous.

Subsequent direct owner confirmation 'このハンマーの切れ味は白です', Sentinel_03a917981fec81919a8eda448c8dc251, supersedes the proposed missing-data provisional approach. equipmentSharpnessContext now accepts only current-equipment, no-argument calls for hammer1154, complete attack/source1154, Handicraft0, exactly five restoration slots containing one sharp:EX and otherwise recognized atk/aff restorations. White 1.32 physical /1.15 element. Provenance OWNER_CONFIRMED_TEMPLATE_MAXIMUM, ownerConfirmed true, ownerProvisional false, OWNER_CONFIRMED_NOT_GAME_VERIFIED; future source update allowed. Other variants and explicit equipment-input calls retain audit gate. No generic fallback or global guard removal.

hammer-sharpness-before.txt reproduces original audit stop. hammer-sharpness-after.txt / hammer-sharpness-result.json: actual original KOTATU_HAM_01 A, B only changes restoration slot0 aff:EX to atk:EX; both normal/maximum STANDARD calculated, saved as A/B, compared and individually restored with identical equipment snapshots and powers. No substitute weapon. Test-only metadata lookup was corrected from compareStep5Snapshot to equipmentSharpnessContext before this passing result.

Same independent reviewer eisen reviewed this diff once and found global build.artia could be paired with a supplied different weapon in captureComboInputs. Corrected by limiting owner branch to arguments.length===0, the current-equipment STANDARD/comparison path. Post-fix hammer-sharpness-boundaries.txt confirms current equipment white and explicit equipment input, other weapon, other production, Handicraft and different sharpness restoration all retain stop. A/B was performed before this final restriction; it uses unchanged no-argument calls. No second review or full A/B rerun. No unrelated tests rerun.

Remaining: other Artia variants/restoration sharpness and explicit-equipment combo path are not established by this owner confirmation. SeregiosII exact multiplier/order, DeclarationII+CM/Convert interactions and other special/free-combo gaps remain as above. Live-game verification pending. No Git writes/publication/full regression.
Final actual file SHA-256 after review correction:
- index.html: 511fa5a6b215745d9464cb61f498e5efe1226fce5d5397da857a80fe99e2a9c1
- bow-adopted-power.js: a4eb020bb03ddc62b691c467270d9d0c34133854648a60ad83197537294d16fb

## 2026-10-19: Common effect resolution/application integration

Owner/Serie explicitly approved prerequisite separation as part of the supplied core integration. Added common-damage-core.js from supplied independent base (HTML operators decoded; explanatory comments shortened, same API/behavior; actual local SHA below, not asserted identical to supplied archive c72fbe1489ebc052b8cba93ed108b937da04fb4d6700efb2c4a17af583113d5f). Added common-effect-adapter.js. No new game coefficients or external-value supplementation. Existing DB identities/ranks and adopted numeric producers remain sources.

calcBuild now applies Attack Boost/Critical Eye/element always-on effects through per-skill core operations once from equipment inputs, retaining component bases. calcMaxAffinity delegates to extracted shared affinity definitions; calcBuild stores those definitions with equipment stats so ordinary-total filtering cannot silently drop existing affinity effects. Conditional resolution is resolveStandardPowerEffects (old standardPowerConditionPlan source checks/individual applied records); scratch element values remain for compatibility/cap checks, not a computed aggregate effect. standardPowerConditionPlan now applies those individual effects through CommonDamageCore.resolveEffects/applyEffects for normal/maximum, retaining existing return fields. Flat and multiplied-base accumulators are separate to preserve noncommuting order. No fictional aggregate skill. Environmental frenzy reward is a separate event when no Gore series is equipped.

standardPowerForStats constructs adopted-bow common plan before routing. bowAdoptedStandardPower uses commonPowerScenario; bowAdoptedScenarioResult consumes common effect results instead of independent attack/element/affinity calculations. Bow normal retains maintained-five-hit Burst; generic normal retains inactive Burst, maximum remains preactivated. Guard-ineligible Offensive Guard produces inactive trace instead of blocking damage; unknown facts/ranks stay errors. bowAdoptedBonusPlan is now a compatibility wrapper over common bonus receipt. Decl/Convert helpers and identity/scope policies retained. Hit math, critical expectation/rounding, ranged corrections, special components, excluded proc effects, UI6:4/dragon renderer and owner hammer-white scope unchanged. ordinaryHit/expectedHit/evaluate are supplied APIs but Hit migration is not claimed.

Changed-path verification only:
- common-core-before.txt / .json: real Kotatu and Salada05 before-state captured; expected failure for equipped Offensive Guard on bow (numeric calculation was blocked).
- common-core-after.txt / common-core-result.json: real KOTATU_BOW_01 and SALADA_BOW_05 normal/maximum unchanged from before, equipped guard has same output and calculation continues; both saved, compared, individually restored with identical snapshots and normal/maximum. Common per-skill receipts present. No fixed damage-value table.
- common-core-boundaries.txt / .json: hammer/GS, existing HBG normal-ammo caller and existing non-adopted bow caller reach normal/maximum through common condition plan. Already-applied Attack Boost not repeated, generic normal Burst inactive, guard-ineligible results unchanged with inactive trace, unknown scenario condition rejected, supplied stats not mutated. First HBG test input omitted required ammoType/normalModeLevel; corrected test input, no product change for that failure.
- One existing eisen read-only review found NORMAL manual scenario could enable Convert/Declaration while pending was checked only for MAXIMUM. Corrected to inspect actual activation facts (Convert active, monster enraged etc.). common-core-review-before.txt expected failure, common-core-review-after.txt PASS: NORMAL active Convert+CM remains pending, inactive normal still calculated. During correction a local pending variable shadowed the existing pending result function; same boundary caught it and variable was renamed before final PASS. Saved A/B final pass precedes this last pending-only fix; boundary alone rerun afterward. No second reviewer/pass requested.

Remaining actual integration scope: Hit formula unification in genericProfileDamage/BowReference.calculate is not implemented. Arbitrary captureComboInputs/evaluateCapturedComboRoute and weapon-specific special-component adapters are not universally migrated; exact adopted bow combo continues through its scenario producer. Existing bowPowerForStats/hbgNormalPowerForStats common-plan connections are preserved and boundary-checked, not claimed as full weapon completion. SeregiosII, unknown DeclarationII/CM/Convert interactions, broader Artia sharpness and prior specific pending decisions remain. Unknowns were not newly excluded. Live-game verification pending.

No model/reasoning change, new agent, Git write/publication or full suite. Existing RESULT and source-sha reused; before-common-core stores pre-change product sources. Python py_compile attempt failed creating its system cache before execution; approved integration script then completed, browser verification above succeeded. No auto-review rejection in this batch.
Final actual SHA-256:
- index.html: 55fd3bca00932da05e2c87ef696c6b18c098a648f0f15c9913c6b0f9e9bf581c
- bow-adopted-power.js: 1f03e801e8ee345e9bd11b1ae67c01081072cac7aa52a7a6b6b3eb3fd13d82ab
- common-damage-core.js: 307b56905b82487c382f446f259dbe9b4ef4d6b84b4e896ebde75f95b6ae776f
- common-effect-adapter.js: dd677fd65a5e2b541ee519ace4f464dc3f877eeea0caacde26a694f87f5826d4

## 2026-10-19: Shared ordinary Hit integration

Read only latest Jira KAN-47/11022 and KAN-44/11023; preserved preceding common-effect integration (bow-adopted-power.js and common-effect-adapter.js hashes unchanged). Changed index.html genericProfileDamage and bow-reference.js calculate to call CommonDamageCore.ordinaryHit and expectedHit. Added coefficient-free affinityBranches to common-damage-core.js; adapters supply normalized affinity and positive/negative physical/element multipliers. Per-Hit state stats, adopted physicalAttackModifier, bow MV/arrow count, range/coating/shot skill/Force Shot/Charge Master inputs continue to come from existing adopted producers and Technique DB. Displayed element converts /10 once at each boundary. No second application of skill stats. No external supplementation or changed game coefficients.

Both migrated producers previously used UNROUNDED_REFERENCE. expectedHit uses identity branch policy: no new minimum, cap, per-Hit or aggregate rounding. Negative bow affinity retains elemental multiplier1; generic element remains non-critical as before. Aggregation still sums the same per-Hit results. Operation grouping changes tiny floating-point rounding only, not game-rounding policy. Trace identifies COMMON_DAMAGE_CORE. Special shells/phials/waves and duration handling unchanged; no 1Hit UI reintroduced.

Evidence: before-common-hit source copies; common-hit-before.txt expected failure for absent shared-Hit trace with common-hit-before.json captured original outputs. common-hit-after.txt/common-hit-result.json PASS: actual KOTATU_BOW_01 and SALADA_BOW_05 pair, original KOTATU_HAM_01 plus restoration-slot0 atk:EX variant pair; each normal/maximum calculation, save, pair comparison and individual restoration match snapshots and powers. Each Hit trace uses common core; all pre-change normal/maximum outputs agree within1e-8. No replacement hammer. common-hit-branches.txt/.json PASS on actual generic/bow call sites with zero/positive/negative affinity: physical and independent elemental critical formulas, one display conversion, fractional unrounded Hit results and sums. These are input/formula assertions, not a fixed game-damage table. No full regression or repeated core contract suite.

Same existing eisen reviewed the three-file diff once, read-only, no blocking findings. Confirmed single element conversion, independent critical branches, negative-affinity elemental1, unchanged coefficients/unrounded behavior and no duplicate expectation. Reviewer notes floating-point regrouping, consistent with recorded tolerance. No further repair or second review required.

Remaining actual entrances: bowgun-normal-reference.js shot, gunlance-shell-reference.js and chargeBladeBuildComparisonAdapter special-component calculations, and arbitrary evaluateCapturedComboRoute/weapon-specific adapters have not been universally migrated to CommonDamageCore. Some existing generic and bow consumers now transitively use the core; this is not completion of all14 weapons/all routes. Existing unknown skill interactions, SeregiosII and broader Artia sharpness limits remain. Hit-level technique/state gating unchanged. No model/thinking change, new agents, Git writes/publication or new numeric DB values.
Final actual file SHA-256 (includes unchanged effect files for continuity):
- index.html: b5a011eef4e65729aafe41dd174a9058f9650b726bf65a34754a73f3fa41e50d
- bow-reference.js: c9e841cbbeb7540d443afedf2a4cffe3cc2d7e5ea93dc1188733eeae2faae969
- common-damage-core.js: da10fb93c0bef797b886932bbf7bdfcde996c06c58a684df2bbba1e7809e5a37
- bow-adopted-power.js: 1f03e801e8ee345e9bd11b1ae67c01081072cac7aa52a7a6b6b3eb3fd13d82ab
- common-effect-adapter.js: dd677fd65a5e2b541ee519ace4f464dc3f877eeea0caacde26a694f87f5826d4

## 2026-10-19: Normal-ammo shared Hit integration completed

Product change: bowgun-normal-reference.js shot() calls CommonDamageCore.ordinaryHit / affinityBranches / expectedHit for normal-ammo physical expectation; trace marks COMMON_DAMAGE_CORE. Existing DB MV/range/mode/normal-up/LBG modifier and shot-local attack/affinity additions retained once. Element0, sharpness1, negative physical0.75, identity rounding policy and existing Hit-count aggregation retained. No caller or shared-core changes in this phase; all five preceding recorded source hashes verified unchanged.

Recovery diagnosis: bowgun-core-diagnostic.txt and bowgun-core-restore-diagnostic.json reproduce restored HBG464 single.damage=null with TECHNIQUE_DB_CONNECTION_PENDING:hbg_normal3, empty stages and picker hbg_normal3. Saved snapshot correctly contains canonical:HBG_NORMAL_AMMO_2. calcSelectedTechniqueDamage reads the separate, unsaved picker rather than saved combo rows. Fixture had incorrectly assumed picker restoration. Only fixture repaired: restore recorded common target conditions, verify saved combo directly, then explicitly select saved canonical technique before single-shot verification. No product guard removal, null replacement, expected-value rewrite or coefficient adjustment.

bowgun-core-after.txt / bowgun-core-result.json PASS: HBG464/465 normal/maximum STANDARD; HBG464/465 and LBG780/781 normal-ammo selected technique, save, same-weapon pair comparison, individual snapshot/actual saved-combo restoration and explicit selected-technique calculation. Pre-change damage agrees within1e-8, saved comparison and restoration agree. Existing before evidence is preserved. LBG remains limited normal-mode/all-three-contact/critical-range reference; full STANDARD is not promoted. Timing/DPS and live-game verification remain pending.

bowgun-core-branches.txt/.json PASS: changed shot formula compared against preserved original function for negative/zero/positive affinity and first/third shot positions with First Shot/Force Shot; additions and unrounded outputs preserved within1e-8. Missing shot position and unsupported LBG skill/mode still rejected. Initial boundary assertion encountered cross-VM object prototype inequality with identical values; test normalized the old receipt to plain JSON, no product change or expected-value change.

Existing eisen performed one read-only shot diff review: no blocking findings; DB coefficients, one-time shot additions, positive/negative critical behavior, unrounded aggregation, element/sharpness exclusions and LBG guards preserved. Reviewer did not independently execute tests or inspect fixture results. No new agent, full regression, Git write/publication or model change.

Remaining entrances: gunlance shells, charge-blade special components and arbitrary weapon-specific combo routes are not universally migrated. Full LBG STANDARD remains unsupported. Prior unknown interactions/Artia limits unchanged. No unresolved blocker within this normal-ammo integration scope.
Final actual SHA-256:
- bowgun-normal-reference.js: 554703071817857c16fab78de6ff504a9dc0f4b1d31480aad5fd5f1cfa70ad14

## 2026-10-19: Special-component input diagnosis — scenario decision pending

No product files changed. Read existing prepareP0ShellContext / GunlanceShellReference.calculate: captured stats.attackComponents.weaponBase and captured total feed existing shell formula and artillery/load-shell modifiers. Shell attack is deliberately original weapon attack, not shared buffed attack; no missing transfer established in this inspected boundary. Existing artillery stacking/action evidence gates retained. GL full STANDARD remains evidence-gated; CB RELEASE/AED standard adapter is not equivalent to adopted SAED.

Found an unconnected conditional result on adopted CB_SAED: captureComboInputs/comboDamageContext supplies ordinary calculated attack/element and maxAffinity; prepareCapturedComboInputs does not resolve/select common conditional stats for CB; chargeBladeComboDamage passes this context to chargeBladeSaedDamage. No claim that NORMAL alone should activate Burst. The actual gap is absence of a declared common scenario for the single-valued SAED operation, unlike the existing adopted bow channel contract.

Minimal real-equipment diagnostic special-input-diagnostic.cjs/.txt/.json: MHDB charge-blade102, water200, true attack160; no armor A vs chest2 BurstLv1 B, same target13/part2700, shield enabled, axe disabled, POWER_ELEMENT, ordinary phial, canonical:CB_SAED. Both selected saved combos produce341.96751000000006 and receive160/200. Existing common NORMAL also160/200, existing common MAXIMUM resolves168/260 for B with no pending entries. Saved A/B comparison and individual snapshot/combo restoration matched their original outputs. These numbers are diagnostic observations, not new coefficients or fixed-value expected tables. No baseline/common-completed weapon suites rerun.

Decision required before repair: choose NORMAL, MAXIMUM, or both channels for adopted SAED's currently single-valued operation. Automatically choosing MAXIMUM would newly assume conditional activations; choosing NORMAL would change existing max-affinity semantics; exposing both changes the result/operation contract. Per explicit instruction to stop on a specification decision, no formula rewrite, guard removal, conditional-skill exclusion or product patch attempted. No external-value lookup is needed; existing DB/common resolver already supplies the numbers.

No product diff, therefore no difference review requested (eisen review not performed in this diagnosis). Remaining affected entrance: adopted CB_SAED / CB_SAED_AED_DERIVED conditional scenario propagation. Broader special routes untouched. No new agents, model change, Git writes or publication. Remote HEAD read attempted per AGENTS but DNS unavailable; local origin/develop is0 behind/6 ahead relative to this branch. Existing dirty files preserved.

Final source SHA verification: all six existing source-sha.json entries unchanged; source-sha.json retained without rewriting. Relevant current index.html SHA-256: b5a011eef4e65729aafe41dd174a9058f9650b726bf65a34754a73f3fa41e50d. No implementation completion claim for this phase.

## 2026-10-19: SAED normal/maximum common-effect connection completed

Owner/Serie resolved the prior decision: adopted SAED uses BOTH existing NORMAL and MAXIMUM scenarios, with attack/element/affinity consistent within each channel. Product index.html only: added adoptedSaedCombo / saedCommonComboContext; connected prepareCapturedComboInputs and evaluateCapturedComboRoute; evaluateComboRoute consumes resolved stats and carries common-effect receipt/policy. Inputs come from captured stats/total/conditions/target; target frenzy context is captured, not reread from current equipment. Scope is canonical CB_SAED and CB_SAED_AED_DERIVED only. Mixed routes and custom scenarios are explicit pending; other CB entrances not promoted.

No single-value compatibility damage is fabricated: top damage=null, channels.NORMAL and channels.MAXIMUM hold separate actual results/context/receipts. Top context is the original captured input only, not a resolved calculation result. Existing damage controls, combo output, saved comparison and export already consume channel fields; reused their two-condition rendering without UI redesign. Saved comparison obtains each build's equipment-derived stats and total with existing common comparison conditions. No ordinary/max-affinity mixed output remains in SAED calculations.

Existing chargeBladeSaedDamage and prepareP0ShellContext verified byte-identical to before-saed-common/index.html. No coefficient/DB/formula/core module changes. Shared stats are applied once; blade physical critical behavior and non-critical elemental phials remain owned by the original formula. No new numeric sources.

Evidence: saed-common-before.txt expected failure 'SAED normal/maximum channels missing'. saed-common-after.txt / saed-common-result.json PASS on same real CB102 base vs chest2 BurstLv1, save A/B, compare both channels, restore each snapshot and both outputs, inspect both comparison display rows. A and B NORMAL341.96751000000006, B MAXIMUM401.29088550000006; B inputs NORMAL attack160/element200, MAX attack168/element260, affinity-15 in both. Compared against real common plan rather than a fixed damage-value table. First after attempt completed numeric save/restore assertions but checked comparison UI after restore had invalidated it; moved that test check to comparison time, no product repair for fixture timing.

saed-common-boundaries.json from same focused run: captured B reevaluated after switching current equipment to A is deeply identical; both SAED variants with ±20 affinity change blade physical but preserve elemental phial; maxAffinity90 is not substituted into NORMAL. Unsupported ConvertLv1 yields a pending MAX while inactive NORMAL remains calculated. Existing pending reasons retained. No old bow/generic/normal-ammo or full regression rerun.

One existing eisen read-only diff review: no blocking findings; confirmed two-technique scope/mixed-route guard, captured effect resolution, unresolved MAX stop, channel stats, unchanged SAED formula/phial critical exclusion/equipment checks. Reviewer accepts top context as captured input with top damage null; consumers must use channel context for resolved results. No second review required.

Remaining: CB mixed/free routes, RELEASE/AED full STANDARD evidence, impact phial-specific unresolved routes, GL full STANDARD/special evidence and previous unknown interactions remain outside this repair. Timing/live verification not promoted. No new agents, model changes, Git writes or publication. All five other recorded product SHA entries remain unchanged.
Final actual index.html SHA-256: be28ef8bcc2ab1270cb204864a0a99dcc227922f228d3bf814e8d976af1cc801

## 2026-10-19: Adopted mixed CB combo channel handoff completed

Actual product change: index.html adoptedSaedCombo predicate only. Existing common NORMAL/MAXIMUM connection now accepts canonical SAED or derived SAED with CB_SWORD_TO_AXE_MORPH, requiring at least one SAED-family technique and every move in this three-technique adopted set. Previously this adopted mixed route stopped at CB_SAED:MIXED_ROUTE_SCENARIO_PENDING. No standalone-morph expansion, new phial adoption, formula rewrite, coefficient or UI changes. Bytes outside this predicate are identical to before-mixed-cb/index.html; other five recorded sources unchanged.

Each captured build's common stats resolve once per channel before existing chargeBladeComboDamage dispatches each technique. Existing SAED, body/axe-boost and Rapid Morph applicability/rounding remain unchanged. Channel totals sum complete stage results. Top damage=null, per-channel damage retained. Missing SAED timing remains COMBO_TIMING_PENDING with dps=null while channel damage is available. Unknown mixed techniques remain blocked rather than zero contributions.

mixed-cb-before.txt expected failure for missing mixed normal/maximum channels. mixed-cb-after.txt, mixed-cb-result.json and mixed-cb-boundary.json PASS: real CB102, SAED then sword-to-axe morph, shield/axe both enabled, base vs chest2 BurstLv1; save A/B, compare both channels/display rows, individually restore snapshots and both values. Base/normal468.9175100000001; Burst maximum535.9508855. Assert shared input equals common scenario, every stage positive, sum equals channel damage, axe-boost component present and timing remains pending. Captured B evaluated after current equipment changed to A is deeply identical. Unknown added technique blocks total. Rapid MorphLv1 leaves total unchanged; Lv3 changes morph only, SAED unchanged. Initial extra-boundary test incorrectly expected Lv1 damage increase; checked existing chargeBladeTechniqueComponents rule (Lv1 multiplier1), corrected only fixture to cover Lv1 unchanged/Lv3 increased. No product coefficient or arbitrary expected-damage-table change.

One existing eisen read-only diff review found no blocking issue; confirmed narrow adopted set, unknown/mixed guards and common resolution once with existing per-component handling. No second review or completed-route regression rerun.

Remaining specific scope: standalone morph and other arbitrary ordinary-body combinations are not newly connected to dual common scenarios; mixed routes with other CB techniques still pending, unadopted impact/release/AED phial routes and full weapon STANDARD evidence remain unresolved. No all-weapon completion claim, new agents, model changes, Git write/publication or full suite.
Final actual index.html SHA-256: bcfef1265a7c68c2e42f3259a4bbe28d2a47726b6de5d238629fc5add5dd2b4b

## 2026-10-19: Canonical OrdinaryHit combo common scenario handoff completed

Found remaining real example: adopted sword-and-shield sns_slash + sns_horizontal used ordinary attack/element with maximum affinity, bypassing common scenario application. index.html now adds adoptedOrdinaryCombo (CANONICAL_DB, same canonicalKind, existing OrdinaryHit handler metadata), commonScenarioCombo, and generalizes prior SAED context helper to commonScenarioComboContext. prepareCapturedComboInputs / evaluateCapturedComboRoute / evaluateComboRoute use shared resolved stats/receipt names. No additional combo-name or skill-formula allowlist. Existing readCanonicalComboHits adoption/identity/special/state validation remains authoritative after routing.

Common resolution/application occurs once per channel, using captured stats/total/conditions/target. Existing skill/effect identity rules remain. Both single adopted ordinary attacks and combinations enter the same metadata-based boundary; legacy unadopted/custom moves do not gain canonical status. SAED uses the same helper with unchanged SAED state/error behavior; this is extraction, not another formula implementation. Existing ordinary/SAED/morph formula sections verified byte-identical, other five source SHA entries unchanged. Original rounding and Hit metadata applicability preserved.

Special-effect protection: ordinary combos with activated DarkArts172 remain explicitly pending (DARK_ARTS_WAVE:COMBO_SCENARIO_PENDING), preventing resolved stats from clearing the effect and silently dropping its separately spawned wave. That combination was previously bonus-effect-gated. Unknown/blocked techniques still block total, not zero-fill. Top damage remains null for channel envelopes; actual damage/DPS stays per channel. Existing two-condition display/export used without redesign.

ordinary-common-before.txt expected failure 'Ordinary mixed normal/maximum channels missing'. ordinary-common-after.txt / ordinary-common-result.json PASS: real SnS985, sns_slash+sns_horizontal, no armor A vs chest2 BurstLv1 B; common NORMAL/MAX inputs, positive stages and exact sum, save A/B, both-channel comparison/display, individual snapshot and both-output restoration. NORMAL29.77, B MAX32.42 (observations, not hardcoded expected damage). ordinary-common-boundary.json: captured B after switching current build to A is deeply identical; zero timing retains identical channel damage but null DPS; supplied maxAffinity90 does not replace base-20; blocked component gives null total. No recovery failures in this batch.

ordinary-common-extra-boundaries.txt/.json PASS for the two distinct new boundaries only: DB-identified AgitatorLv1 affinity stays out of NORMAL and enters MAX; actual DarkArts172 fixture identity on captured GS combo keeps both channels pending. Saved comparison was not rerun for these extra boundaries. No finished bow/normal-ammo/SAED suites or full regression run.

One existing eisen read-only diff review: no blocking findings; confirmed metadata scope, existing Hit/equipment guards, captured input independence, per-channel application once, special-wave pending and unchanged SAED contract aside from internal names. No new agents, model changes, Git write/publication or numeric sources.

Remaining concrete entrances: dedicated InsectGlaiveBodyHandler / HuntingHornBodyHandler scenario handling, CB standalone morph/other phial routes, mixed ordinary/special handler routes and custom/unadopted techniques are outside this ordinary adapter change. DarkArts separate-wave common combo scenario remains pending; missing duration remains a DPS-only blocker for calculable channels. No all-weapon completion claim.
Final actual index.html SHA-256: 852c7ef548020a17331452d0dd507a3322f0cab18f955d90cd960da30921ab27

## 2026-10-19: Existing DarkArts wave common scenario connection completed

Owner explicitly authorized connecting existing adopted wave formula to each saved build's NORMAL/MAXIMUM shared conditions. index.html actual changes: commonScenarioComboContext no longer stops all activated172 inputs merely for missing connection; evaluateComboRoute passes capturedInput.stats as wave identity source when a commonScenarioReceipt exists. The already-resolved context still supplies numerical attack/affinity. Existing darkArtsWaveForTechnique owns adoption identity, applicable charge stages, afterHit, one event per technique, compatibility guards and dedicated DarkArtsReference.observed call. This is an actual connection, not treating the wave as zero or deleting unknown-interaction guards.

No wave/body formula, source coefficient, target map or rounding change. darkArtsWaveForTechnique is byte-identical to before-wave-common/index.html. Original parent172 HP-policy exclusion remains; only existing adopted separate component is added. Displayed fixed dragon component is still dedicated DB data with its original Dragon Attack policy, not the weapon's common element. SOURCE_REFERENCE/UNVERIFIED, source scope WAVE_ONLY_DRAGON_ATTACK_ONLY_NO_OTHER_BUFFS and live-game pending metadata retained; accepting channel numerical inputs does not independently verify every buff interaction. Unsupported combinations still fail through the original guard.

wave-common-before.txt reproduces both channels DARK_ARTS_WAVE:COMBO_SCENARIO_PENDING for real2-piece build. wave-common-after.txt / wave-common-result.json PASS: GS236, chest654 A vs chest654+waist656 B, gs_charge3 twice plus non-target GS_STRONG_WIDE_SLASH_3; NORMAL/MAX stats match own common plan, each target adds one wave, non-target adds none, Hit count not used to duplicate events. Channel totals equal stage sums. Save A/B, both-channel comparison/display and individual snapshot/output restoration pass. Captured B after current equipment switches to A is deeply identical. Burst interaction remains blocked in both channels. No completed weapon suites or full regression rerun.

Observed B NORMAL385.16999999999996 / MAX424.30975. Wave per event NORMAL physical19.845+dragon12, MAX physical21.994875000000004+dragon12; channel attack90/95 and affinity0/20. Additional arithmetic check of saved output confirms physical uses channel attack/affinity once; fixed dragon unchanged. These are diagnostic observations, not new fixed-value expectations. Wave timing remains pending, hence DPS null while channel total is available.

One existing eisen read-only review: no blocking findings; captured identity vs resolved numeric context, no double application, target/afterHit/count, original guards/coefficients and UNVERIFIED retained. No new agent, model change, external values, Git write or publication.

Remaining: original wave incompatibilities (Dark/Charge Master/Critical Element/Burst/Coalescence/Element Absorption), missing/zero dragon hitzone treatment and event duration still retain their specific pending gates. Other dedicated Handler mixtures and unadopted techniques/phials were not expanded. Full STANDARD routing was not changed or declared complete.
Final actual index.html SHA-256: 929633dde7b7e7606e9a58877a8977a26cbece7d895e25a5135f9c29fa389650
Unchanged dark-arts-reference.js SHA-256: 4ffc5c82aca14c09681380ebcf0cadb961db0aa918e9a5155dc1b6c8257ef935

## 2026-10-19: Existing target dragon hitzone handoff completed

Prior evidence already establishes timing does not block damage, so no timing changes. Actual missing input: selected MHDB part had dragon multiplier but empty powerDragonHz remained empty in compareStep5Snapshot, stopping adopted wave. index.html dragonHitzoneSource now returns existing validated dragonTargetReceipt only for empty input; compareStep5Snapshot uses its percent value as a STRING, preserving existing input contract. Explicit/manual input wins, including0. renderDragonHitzoneSource shows percentage/automatic source; target-change notice updated. No guessed meat values, new formulas/coefficients or relaxed zero-hitzone minimum-damage gate.

Minimal proof dragon-input-before.txt: real Wave B blocked with DRAGON_HITZONE_REQUIRED despite selected Rathian head13/2700 data. dragon-input-after.txt / dragon-input-result.json PASS: empty field uses actual DB30%; NORMAL/MAX calculations, saved A/B comparison/display and individual snapshot/output restoration. Manual17 wins; changed part2701 uses its own recorded receipt; no selected part remains UNSET/empty and damage pending. First after failed comparison restoration because fallback number30 differed from restored DOM string'30'; fixed snapshot representation, guards retained, same operation passed.

One existing eisen read-only review of the index input diff: no blocking findings, manual priority/known0/absence/provenance and target reset preserved. After that review, scoped compatibility inspection found old empty/UNSET comparison sessions fail on reload under automatic-source shape. comparison-session.js validate now normalizes the dragon source shape on BOTH sides of the generic shape check (its independent exact source keys/range/target validation remains unchanged). restore migrates only old empty+UNSET to actual restored target DB receipt before final equality; missing data stays unset, manual untouched. This follow-up was not sent for a second independent review.

dragon-input-legacy-before.txt reproduced reload failure. Diagnostic-only in-memory error capture identified SESSION_CONDITION_SHAPE; the initial old-value migration alone did not fix it, then shape normalization did. Final dragon-input-legacy-after.txt and legacy-result/manual-reload JSON PASS with instrumentation removed: cached-data reload restores legacy empty/UNSET as known target receipt and separately preserves manual17/MANUAL. No saved-comparison rerun after this session-only fix. No full suite or completed weapon revalidation.

Remaining real blockers: wave interactions with Dark/Charge Master/Critical Element/Burst/Coalescence/Element Absorption, absent actual target dragon data, zero-dragon minimum-damage rule, and event duration for DPS. Existing known positive target dragon data no longer requires manual copy. No new agent/model, external lookup/numeric supplementation, Git writes or publication.
Final actual SHA-256:
- index.html: 554c00b17a8a326a2dc58b8c69c63265c6a9950a21d7c616456d249ae0464de1
- comparison-session.js: e7764cbd39caa36511f4283a83360c959b527bf9750db3292f7ade173942413e

## 2026-10-19: Budget-limited DarkArts pending check — no product change

Reused recorded evidence only: wave duration already leaves NORMAL/MAXIMUM total damage available and DPS null; no timing repair needed. Examined Burst interaction only. Common weapon attack/element bonuses do not establish whether/how Burst elemental addition applies to the wave's independent fixed dragon component. Adopted wave scope remains WAVE_ONLY_DRAGON_ATTACK_ONLY_NO_OTHER_BUFFS; removing the interaction guard or applying weapon element would invent applicability. Existing information cannot resolve this one point, so stopped without product changes, tests, external research, extra review or SHA recomputation. Prior final hashes remain recorded above. Known positive dragon-hitzone normal/maximum wave calculations and saved A/B comparison remain available within adopted combinations. Prior session compatibility repair passed reload checks but still lacks final independent diff review; that caveat is retained.

## 2026-10-19: Owner-specified Burst + DarkArts wave repair completed

Changed index.html only. darkArtsWaveForTechnique removes Burst alone from its unknown-interaction guard. Shared Burst resolution and wave receipt carry one BURST_ELEMENT_APPLICABILITY definition: WEAPON_TRUE_ELEMENT_ONLY, excluded DARK_ARTS_WAVE_FIXED_DRAGON, OWNER_SPECIFICATION / NOT_LIVE_MEASURED. Existing numeric source provenance remains separate. Wave formula already reads fixed dragon from existing DB (600), never shared weapon element, so no formula/DB rewrite required. Attack context/addition remains unchanged. Other unknown-interaction/zero-hitzone/timing guards retained.

Minimal evidence: wave-burst-before.txt reproduces Burst guard stopping both channels; wave-burst-after.txt and wave-burst-result.json PASS real ice GS259, chest654+waist656 on both A/B, B adds legs93 Burst1; two charge3 plus non-target strong wide slash. Weapon element NORMAL550 both, MAX A550/B630; attack MAX A195/B205. Wave dragon per event13.8 unchanged across all channels/builds; base600 from DB. Wave physical MAX56.7567 ->59.6673 maintains attack bonus. Shared plan matches inputs, stage sums/counts valid, saved A/B comparison/display and individual snapshot/both-channel restoration pass. wave-burst-body-check.txt additionally verifies actual weapon-body elemental Hit damage increases in all three stages from saved evidence, without browser rerun. Charge Master direct wave guard still blocks. No hardcoded expected damage table; numeric observations above are test outputs.

Fixture corrections: initial GS247 had an unrelated Critical Draw MAX pending, so selected real GS259 with Focus instead (no product guard changed). After product patch save/compare/restore passed but extra Charge Master assertion looked for a wave reason after an earlier common guard; fixture changed to call wave boundary directly, final scoped run PASS. No further product repair needed.

Existing eisen read-only review performed once. Wave diff has no blocking finding: Burst alone removed from guard; DB fixed dragon/formula/other guards retained; owner applicability separate from numeric provenance. Reviewer flagged existing index.html DARK_ARTS:CONDITIONAL_ELEMENT_STACKING_PENDING as potentially blocking MAX. Root checked existing standardGroupPowerPlan uses hpRelevantBonusEffects, and saved real-equipment evidence has groupPlan.applied=[] and pending=[]; both channels successfully computed/compared/restored. That guard is for the separate body-element multiplier branch, not the adopted separate-wave route demonstrated here. Guard retained; no second review or broader body adoption. Prior comparison-session.js compatibility diff still lacks independent review.

Remaining: other unsupported wave interactions, absent/zero dragon target treatment, duration/DPS, live measurement and broader STANDARD/body-element multiplier routing unchanged. Prior session-only review caveat retained. No external research, new agents/model change, full regression, Git writes or publication.
Final actual SHA-256:
- index.html: 98678f68adb0d5ba4d5e14f26b98588a95cd40957ad9caacf6d2388db5f679aa
- dark-arts-reference.js (unchanged): 4ffc5c82aca14c09681380ebcf0cadb961db0aa918e9a5155dc1b6c8257ef935

## 2026-10-19: DarkArts body guard reachability resolved — no product change

Read only specified latest Jira comments KAN-47/11040 and KAN-44/11041, preceding RESULT/review and directly implicated source functions. No other historical evidence or external game research. Owner-specified Burst weapon-element addition / no fixed-wave-dragon addition remains unchanged.

The suspected DARK_ARTS:CONDITIONAL_ELEMENT_STACKING_PENDING in resolveStandardPowerEffects requires groupPlan.applied containing the separate DarkArts body multiplier. standardGroupPowerPlan first calls hpRelevantBonusEffects -> classifyHpBonusEffects -> MHSeriesGroupHpPolicy.activated. Parent172 is absent from INCLUDE ids; both formal ranks431/432 are excluded as DARK_ARTS_OTHER_COMPONENTS. Therefore this branch does not stop any currently adopted valid DarkArts condition through this path. Its mere presence did not establish an active blocker. No pending guard removed, no new exclusion, no zero substitution, no multiplier/order adoption. Separate wave adoption continues via darkArtsWaveForTechnique using original activation identity.

Minimal diagnostic wave-body-guard.cjs/.txt/-result.json PASS once: official MHDB2/4-piece identities, all existing body-source supported kinds, no DarkArts groupPlan entry; GS shared resolver has no DARK_ARTS body pending for either rank. Uses existing Burst build evidence; no policy override. Previous saved A/B normal/maximum restoration evidence reused, not rerun because no product change. All eight recorded product SHA entries verified unchanged.

Existing eisen one read-only review: withdrew previous MAX-blocking concern. Parent172 is not in body INCLUDE policy; official ranks431/432 do not enter groupPlan, so the cited body guard is unreachable in current adopted paths. Code and focused JSON agree. Pending comparison-session.js compatibility diff (against before-dragon-input) has no blocking findings: only old blank+UNSET migrated to actual restored target receipt; exact source key/target/state/value and final restoration equality checks retained. No tests rerun by reviewer.

Outcome: reachability concern resolved; no repairable active blocker found in this requested guard. Prior session-diff independent-review caveat is now closed (read-only review, prior tests reused). Future adoption of the separate recoverable-damage body multiplier would still need its applicability/order with Burst established; the wave decision does not establish that multiplication order. It is not a currently adopted runtime blocker and no new owner decision was assumed. Other wave interactions, zero dragon rules, timing/DPS and live measurement remain unchanged. No new agent/model, Git write/publication or full regression.
Final unchanged SHA-256:
- index.html: 98678f68adb0d5ba4d5e14f26b98588a95cd40957ad9caacf6d2388db5f679aa
- comparison-session.js: e7764cbd39caa36511f4283a83360c959b527bf9750db3292f7ade173942413e
