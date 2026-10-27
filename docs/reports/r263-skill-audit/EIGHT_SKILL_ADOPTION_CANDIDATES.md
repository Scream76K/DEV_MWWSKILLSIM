# Eight missing-skill adoption candidates — read-only product audit

Date: 2026-10-27. HEAD b2c590d3057c80b23927bcec3d8b3c1713f702bc. This record changes no product coefficient. Prior pass17 flying changes retained.

MHDB identity/rank source: fixed mhdb-skills.json. Numeric source S: https://kuroyonhon.com/mhwilds/program/skill.php (read today). G: https://mhw.fuguai-online.com/2025/12/19/sennsen/ (author's published test, 2025-12-19); corroborating measured examples https://gamewith.jp/mhwilds/534856 . Source confirmation is not current-game verification or owner adoption.

|ID|Decision status|Candidate / minimum contract|
|---|---|---|
|89|NUMERIC_CANDIDATE_INPUT_ADOPTION_PENDING|3部位・滑走強化:発動中会心+30。自己active状態→共通会心、100上限、非会心成分除外。 Source S|
|159|SOURCE_COMPONENT_UNIT_INCOMPLETE|Lv1放熱中:砲撃攻撃1.35、火+3。+3の表示/実属性単位と対象砲撃別範囲を確認前に実装しない。 Source S|
|163|SOURCE_COMPONENT_UNIT_INCOMPLETE|Lv1特殊斬れ味補正1.4・鈍器無効。物理置換/属性係数の分離を確定してから実装。163と160は別スキル。 Source S|
|164|NUMERIC_CANDIDATE_INPUT_ADOPTION_PENDING|Lv1取得鉱石加算10/15/30、累積上限90。取得内容または根拠付き累積値を明示しattack-flatへ。 Source S|
|171|NUMERIC_CANDIDATE_INPUT_ADOPTION_PENDING|Lv1生焼け:会心10/属性100、こんがり:10/300、こげ:0/300。最新結果で置換、属性flat→cap。斬れ味回復はHP倍率でない。 Source S|
|174|NUMERIC_CANDIDATE_INPUT_ADOPTION_PENDING|Lv1飛天螺旋斬後の自己会心15、共鳴II時25へ置換。事前発動入力案。味方計算/新技追加は別。 Source S|
|178|NUMERIC_CANDIDATE_INPUT_ADOPTION_PENDING|宣戦呼応I2部位:属性1.2+20、II4部位:1.3+40。上位rank置換、乗算/flat/cap分離。怒りトリガー後active状態を明示。防壁は非HP、属性弾は適否追加確認。 Source G|
|181|LIMITED_SCOPE_NUMERIC_ADOPTION_PENDING|Lv1太刀/弓:水耐性合計R×4を表示水属性flatへ。R>=0の水武器本体を先行候補。他武器/負耐性/無属性付与は未確認。 Source S|

## Proposed shared contract, not implemented
- Existing identity/rank validation and highest-rank replacement precede effects. 89 uses standardGroupPowerPlan; weapon skills need producer entry plus the same L3 effect route. Display-only calcMaxAffinity is not a second numerical producer.
- 89/174/171 affinity goes once to completed affinity and the existing per-Hit critical resolver; noncritical explosions/sound remain unaffected.
- 164 goes into attackComponents.flat, not a final damage multiplier. 171/181 use elementBasis flat;178 uses multiplier and flat separately before existing cap. Ammo and special-source element are not silently equated to weapon display element.
- Normal uses explicit active/inactive state. Maximum may use feasible activation, but cannot invent ore inventory, cooking result, another-party buff or target availability. Missing is not false. Proposed preactivated snapshots do not require new techniques or time/DPS simulation.
- Cook's latest result overwrites;174共鳴II replaces15 with25;178 rankII replacesI. Optional utility (sharpness recovery, barrier, duration, party benefit) is separated, not a reason to drop the self buff.
- None of these eight is wholly pure utility.159 modifies weapon shelling, not annotation-only skill extra damage. No new separate damage event is inferred.

## Remaining precise source boundaries
159: source states attack multiplication and fire +3; current shell reference uses display fire/10. Do not silently choose +3 versus display+30 or copy normal-shell artillery adoption to every shell action.
163: text says sharpness modifier becomes1.4 and GL shelling ignores it. It does not unambiguously provide a separate elemental sharpness coefficient. Do not multiply both channels by1.4, or treat163 as160刃鱗増装. Resolve physical replacement/element factor first.
178: anger is the trigger, not proof that effect ends immediately on de-enrage. Source's timer discussion also concerns the barrier; avoid inferring an element timer. Explicit active state avoids inventing event expiry. Ammo eligibility remains to establish separately.
181: source explicitly lists only LS/Bow×4. Proposed nonnegative resistance water-weapon scope is a limitation, not a discovered universal negative-resistance clamp.

## Adoption grouping and implementation plan
Recommend one owner decision for89,164,171,174,178 weapon-element scope,181 limited scope using the above numeric candidates and explicit activation inputs.159/163 need the two component/unit clarifications above, not another request to confirm already-readable numbers.
No affirmative prior coefficient adoption found in r263 gap reports, r253 scope records or current producer for these8. Therefore no safe approved-only product wiring fix was identified in this batch. Their classifications remain missing; a documented candidate is not a completed connection.
After adoption: shared producer/L3 affinity-flat, attack-flat and element-basis routes; minimal contrasts for cap/overwrite/noncritical exclusion, not8×14 runs.

## Preservation / verification
No product edits, tests, stage, commit or push in this batch. No browser/storage/server operations. Classification stays complete8 / partial63 / missing15 / annotation6 / nonHP87, total179. Only this document and matrix research fields updated. Prior pass17 executable evidence remains at its original hashes.
