# 採用範囲に基づく監査訂正

ID2/6と同じ基準を適用。完全は承認済み対象の静的接続であり、全技・任意併用・実装備・実機・現行hash全回帰を意味しない。未採用拡張や実機未確認のみを部分理由にしない。一方、具体的な採用経路の根拠不足/併用拒否は残す。製品編集・テスト再実行なし。

## 手本181

OWNER_APPROVED_PROVISIONAL: Lv1、水属性太刀/Bow、非負の既知装備耐性R×4を表示属性flatへ。承認済み吸収属性は最大のみ別寄与。
calcBuild → equipmentThunderResistanceInput(water) → MHWaterConversionRule / waterEntries → L3 element add → common cap / Bow elementBasis → Formula
LS/Bow低耐性/cap/通常読込/保存A/B旧証拠。吸収指定のDOM change→公開calcBuild/Bow Lv1/保存A/Bは現hash証拠。
他武器/負耐性/非水/無属性付与/属性弾/未定義食事状態は未採用。実装備合法性と実機未確認。

## 判定（個別根拠）

|ID/名前|旧→新|採用範囲・実経路|既存証拠・保存比較|残る範囲|
|---|---|---|---|---|
|5 爆破ビン追加|部分→完全|弓NONE/POWER/CLOSE_RANGEで未使用のビン付与能力。正規ID/名前/Lv1を検査し数値効果を生成しない。 calcBuild → classifySkill → resolveSkillApplicability UNUSED_COATING_CAPABILITY_ONLY → BowReference（値不変）|DARK_ARTS_CAPABILITY_LOCAL.md; coating-capability-after.json。5能力同時未使用・毒選択拒否の旧公開証拠。保存比較専用実行なし、skill snapshot共通経路の静的確認。|状態異常ビン選択時の蓄積/ダメージ、新規ビンは未採用。能力の未使用許可と使用実装を区別。 実機未確認。|
|24 チャージマスター|部分→完全|採用GS3技と採用Bow reference技のCM。既存倍率→flat→元属性cap、属性変換/雷/水の承認済み本体経路。 calcBuild → referenceSkills / gsChargeActive / bowChargeResolved → resolveEffects / BowReference.elementBasis → cap → Formula|CM_CONVERSION_CONNECTION.md; cm-conversion-execution.json; WATER_CONVERSION_CONNECTION.md; water-combination-execution.json。GS CM＋龍/雷 保存A/B、Bow CM＋水強化＋水変換 保存復元の旧証拠。|未採用の溜め技・射撃モード。個別の未採用併用を含む全組合せ保証ではない。 実機未確認。|
|41 龍属性攻撃強化|部分→完全|対応属性の採用武器本体・採用SA成分・Bow・通常属性弾。専用cap基礎を保持。非火強化は竜撃弾火へ非適用。 calcBuild calcElementSkill → MHWElementSkillResolver → elementComponents / ammoElementCondition → engine / SA component / BowReference / BowgunElementReference cap → Formula|PASS13_ELEMENT_CAP.md; WATER_CONVERSION_CONNECTION.md; water-conditional-execution.json。GS/属性弾の旧境界証拠、後続水Bow/LS条件併用証拠。SA等は静的接続、全武器実行なし。|未採用特殊成分、新規技。火強化50の竜撃弾専用問題を非火4属性へ転記しない。 実機未確認。|
|44 麻痺ビン追加|部分→完全|弓NONE/POWER/CLOSE_RANGEで未使用のビン付与能力。正規ID/名前/Lv1を検査し数値効果を生成しない。 calcBuild → classifySkill → resolveSkillApplicability UNUSED_COATING_CAPABILITY_ONLY → BowReference（値不変）|DARK_ARTS_CAPABILITY_LOCAL.md; coating-capability-after.json。5能力同時未使用・毒選択拒否の旧公開証拠。保存比較専用実行なし、skill snapshot共通経路の静的確認。|状態異常ビン選択時の蓄積/ダメージ、新規ビンは未採用。能力の未使用許可と使用実装を区別。 実機未確認。|
|65 減気ビン追加|部分→完全|弓NONE/POWER/CLOSE_RANGEで未使用のビン付与能力。正規ID/名前/Lv1を検査し数値効果を生成しない。 calcBuild → classifySkill → resolveSkillApplicability UNUSED_COATING_CAPABILITY_ONLY → BowReference（値不変）|DARK_ARTS_CAPABILITY_LOCAL.md; coating-capability-after.json。5能力同時未使用・毒選択拒否の旧公開証拠。保存比較専用実行なし、skill snapshot共通経路の静的確認。|状態異常ビン選択時の蓄積/ダメージ、新規ビンは未採用。能力の未使用許可と使用実装を区別。 実機未確認。|
|79 睡眠ビン追加|部分→完全|弓NONE/POWER/CLOSE_RANGEで未使用のビン付与能力。正規ID/名前/Lv1を検査し数値効果を生成しない。 calcBuild → classifySkill → resolveSkillApplicability UNUSED_COATING_CAPABILITY_ONLY → BowReference（値不変）|DARK_ARTS_CAPABILITY_LOCAL.md; coating-capability-after.json。5能力同時未使用・毒選択拒否の旧公開証拠。保存比較専用実行なし、skill snapshot共通経路の静的確認。|状態異常ビン選択時の蓄積/ダメージ、新規ビンは未採用。能力の未使用許可と使用実装を区別。 実機未確認。|
|83 溜打強化|部分→完全|OWNER_APPROVED_PROVISIONAL: HAM_MIGHTY_CHARGE_UPPERCUT本体物理1.03のみ。他採用3技・属性不変。 calcBuild → MHChargeStrikeRule / chargeStrikeEntries → physical:0 coefficient effect → common Formula|CHARGE_STRIKE_CONNECTION.md; charge-strike-execution.json。公開4技OFF/ON・不正Lv/未知技・保存復元の旧証拠。保存A/B専用追加実行なし。|原典のアッパー除外との対応未確認。ユーザー実機検証待ち。未採用技/気絶計算へ拡張しない。 実機未確認。|
|84 水耐性|部分→完全|MHDB各Lvの水/雷/全属性耐性を装備耐性と合算、承認済み変換本体へ供給。防御Lv1〜3の耐性加算なし。 calcBuild → equipmentThunderResistanceInput(element) → water/thunderResistanceInput → conversion flat → common cap / Bow elementBasis|NIGHT_REMAINING_ROUTE_RECONCILIATION.md; WATER_CONVERSION_CONNECTION.md; ABSORPTION_RESISTANCE_CONNECTION.md; absorption-resistance-execution.json。水84ありLS/Bow旧証拠、吸収状態UI/save/shared A/Bの現hash証拠。防御全Lv/雷耐性全Lvは静的。|防御値自体/生存指標、新規食事・未定義状態、変換の未採用特殊成分は別責務。 実機未確認。|
|87 火事場力|部分→部分|低体力/満タンの共通枝は接続済み。ただし採用特殊referenceでの攻撃倍率consumerまで、現在行が引用する証拠は個別対応を示していない。全武器実行不足ではなく静的consumer対応不足。|PARTIAL39_ACTION_MAP.md / 現adapter:367–430 / DARK_ARTS_CAPABILITY_LOCAL.md|追加実行不足を一律理由にしない。|
|91 水属性攻撃強化|部分→完全|対応属性の採用武器本体・採用SA成分・Bow・通常属性弾。専用cap基礎を保持。非火強化は竜撃弾火へ非適用。 calcBuild calcElementSkill → MHWElementSkillResolver → elementComponents / ammoElementCondition → engine / SA component / BowReference / BowgunElementReference cap → Formula|PASS13_ELEMENT_CAP.md; WATER_CONVERSION_CONNECTION.md; water-conditional-execution.json。GS/属性弾の旧境界証拠、後続水Bow/LS条件併用証拠。SA等は静的接続、全武器実行なし。|未採用特殊成分、新規技。火強化50の竜撃弾専用問題を非火4属性へ転記しない。 実機未確認。|
|95 連撃|部分→完全|既存武器別連撃表の最大攻撃flat/属性flat。ボウガン属性flat0を維持し完成攻撃は攻撃依存属性へ供給。 standardPowerConditionPlan STANDARD_BURST_SOURCE → attackComponents / maximumElementComponents / ammoElementCondition → adopted Formula|PASS13_ELEMENT_CAP.md; CONDITIONAL_CONVERSION_CONNECTION.md; CONVERSION_MAX_FLAT_CONNECTION.md; WATER_CONVERSION_CONNECTION.md。条件変換・水LS/Bow・115＋連撃の旧限定証拠。全武器/Lv実行なし。|新規技・新規発動頻度。ボウガン属性flat0を未実装と扱わない。 実機未確認。|
|116 毒ビン追加|部分→完全|弓NONE/POWER/CLOSE_RANGEで未使用のビン付与能力。正規ID/名前/Lv1を検査し数値効果を生成しない。 calcBuild → classifySkill → resolveSkillApplicability UNUSED_COATING_CAPABILITY_ONLY → BowReference（値不変）|DARK_ARTS_CAPABILITY_LOCAL.md; coating-capability-after.json。5能力同時未使用・毒選択拒否の旧公開証拠。保存比較専用実行なし、skill snapshot共通経路の静的確認。|状態異常ビン選択時の蓄積/ダメージ、新規ビンは未採用。能力の未使用許可と使用実装を区別。 実機未確認。|
|118 防御|部分→完全|MHDB各Lvの水/雷/全属性耐性を装備耐性と合算、承認済み変換本体へ供給。防御Lv1〜3の耐性加算なし。 calcBuild → equipmentThunderResistanceInput(element) → water/thunderResistanceInput → conversion flat → common cap / Bow elementBasis|NIGHT_REMAINING_ROUTE_RECONCILIATION.md; WATER_CONVERSION_CONNECTION.md; ABSORPTION_RESISTANCE_CONNECTION.md; absorption-resistance-execution.json。水84ありLS/Bow旧証拠、吸収状態UI/save/shared A/Bの現hash証拠。防御全Lv/雷耐性全Lvは静的。|防御値自体/生存指標、新規食事・未定義状態、変換の未採用特殊成分は別責務。 実機未確認。|
|121 氷属性攻撃強化|部分→完全|対応属性の採用武器本体・採用SA成分・Bow・通常属性弾。専用cap基礎を保持。非火強化は竜撃弾火へ非適用。 calcBuild calcElementSkill → MHWElementSkillResolver → elementComponents / ammoElementCondition → engine / SA component / BowReference / BowgunElementReference cap → Formula|PASS13_ELEMENT_CAP.md; WATER_CONVERSION_CONNECTION.md; water-conditional-execution.json。GS/属性弾の旧境界証拠、後続水Bow/LS条件併用証拠。SA等は静的接続、全武器実行なし。|未採用特殊成分、新規技。火強化50の竜撃弾専用問題を非火4属性へ転記しない。 実機未確認。|
|127 雷属性攻撃強化|部分→完全|対応属性の採用武器本体・採用SA成分・Bow・通常属性弾。専用cap基礎を保持。非火強化は竜撃弾火へ非適用。 calcBuild calcElementSkill → MHWElementSkillResolver → elementComponents / ammoElementCondition → engine / SA component / BowReference / BowgunElementReference cap → Formula|PASS13_ELEMENT_CAP.md; WATER_CONVERSION_CONNECTION.md; water-conditional-execution.json。GS/属性弾の旧境界証拠、後続水Bow/LS条件併用証拠。SA等は静的接続、全武器実行なし。|未採用特殊成分、新規技。火強化50の竜撃弾専用問題を非火4属性へ転記しない。 実機未確認。|
|152 属性変換|部分→部分|承認済み龍本体flat/capと列挙済み系列合流は接続済み。特殊成分未採用だけを部分理由にしない。172rankI健康枝との併用でactiveBonus照合拒否が残り、健康枝ごとの計画整合は未確定。|PARTIAL39_ACTION_MAP.md / 現adapter:367–430 / DARK_ARTS_CAPABILITY_LOCAL.md|追加実行不足を一律理由にしない。|
|156 雷耐性|部分→完全|MHDB各Lvの水/雷/全属性耐性を装備耐性と合算、承認済み変換本体へ供給。防御Lv1〜3の耐性加算なし。 calcBuild → equipmentThunderResistanceInput(element) → water/thunderResistanceInput → conversion flat → common cap / Bow elementBasis|NIGHT_REMAINING_ROUTE_RECONCILIATION.md; WATER_CONVERSION_CONNECTION.md; ABSORPTION_RESISTANCE_CONNECTION.md; absorption-resistance-execution.json。水84ありLS/Bow旧証拠、吸収状態UI/save/shared A/Bの現hash証拠。防御全Lv/雷耐性全Lvは静的。|防御値自体/生存指標、新規食事・未定義状態、変換の未採用特殊成分は別責務。 実機未確認。|
|160 刃鱗増装|部分→完全|採用固定3射・接撃ビンの最大物理1.25、属性不変、射数消費とForce排他。 TECHNIQUE_DB_R115_BOW_STATE → adapter referenceFormula fixedIds → BowReference.standard|NIGHT_REMAINING_ROUTE_RECONCILIATION.md; COMMON_FORMULA_CONSUMERS.md。静的採用経路追跡。今回固有実行・保存A/B追加実行なし。静的完全と実行未確認を分離。|任意射数・未採用ビン/射撃モード。 実機未確認。|
|162 海竜の渦雷|部分→完全|rank/部位一致時の最大自己会心15を既存resolverで一回。固定/雷追加ダメージは注釈のみ。 standardGroupPowerPlan → calcMaxAffinity → critical-capable Formula; conversionGroupPlan照合、annotation separate|CONVERSION_SOURAI_CONNECTION.md; conversion-sourai-execution.json。rankII＋165公開通常最大/保存比較/不正rankの旧証拠。rankI/152静的。|注釈専用追加ダメージ式の未確定を本体欠損扱いしない。時間/発動頻度、新規技未採用。 実機未確認。|
|165 耐性変換【雷】|部分→部分|承認済み雷本体・耐性producer・capと列挙済み系列合流は接続済み。特殊成分未採用だけを部分理由にしない。172rankI健康枝との併用でactiveBonus照合拒否が残り、健康枝ごとの計画整合は未確定。|PARTIAL39_ACTION_MAP.md / 現adapter:367–430 / DARK_ARTS_CAPABILITY_LOCAL.md|追加実行不足を一律理由にしない。|
|172 暗黒騎士の証|部分→部分|rankI本体倍率/追撃除外/健康枝は接続済み。一方、既採用152/165との併用はconversionResistanceBonusesResolvedに172対応がなく拒否が残る。rankII未採用だけを部分理由にしない。|PARTIAL39_ACTION_MAP.md / 現adapter:367–430 / DARK_ARTS_CAPABILITY_LOCAL.md|追加実行不足を一律理由にしない。|
|181 耐性変換【水】|部分→完全|OWNER_APPROVED_PROVISIONAL: Lv1、水属性太刀/Bow、非負の既知装備耐性R×4を表示属性flatへ。承認済み吸収属性は最大のみ別寄与。 calcBuild → equipmentThunderResistanceInput(water) → MHWaterConversionRule / waterEntries → L3 element add → common cap / Bow elementBasis → Formula|WATER_CONVERSION_CONNECTION.md; water-conversion-execution.json; water-combination-execution.json; water-conditional-execution.json; ABSORPTION_RESISTANCE_CONNECTION.md; absorption-resistance-execution.json。LS/Bow低耐性/cap/通常読込/保存A/B旧証拠。吸収指定のDOM change→公開calcBuild/Bow Lv1/保存A/Bは現hash証拠。|他武器/負耐性/非水/無属性付与/属性弾/未定義食事状態は未採用。実装備合法性と実機未確認。 実機未確認。|

## 証拠版の扱い

以下は保存済み証拠の対象hash。currentと違うものは歴史的な局所実行であり、現行全回帰合格ではない。ハッシュ未記載の報告は静的根拠としてのみ利用。

現在の静的読取対象: `{"index.html": "8081801821a485b5468ed36dd33a43c605618c0c6224d511f92d510ad4c22fd3", "hope-hammer-browser-adapter.js": "defcc6096c17841fbf1743bc01748f42776fe1e72976e630fdc658e348ce6a45"}`

- coating-capability-after.json: `{"index.html": "e252fb8b402c83bde393c9e23231f93ee86875ef9dcd8db39eee504275db3f43", "hope-hammer-browser-adapter.js": "622476031d8f2244c5bd677a4cf05591b2f78ab3cd3a39c6e133348b58fea2c1"}`。実行範囲は上表/元manifest参照。
- cm-conversion-execution.json: `{"index.html": "b65c0b3d3c1c47da1803974e4399a7d9eb6c2156eb5ba56c6635f8983d35074f", "hope-hammer-browser-adapter.js": "57ccf1dd8203e7bff70f79b115de55e2221ee2cf8d435ab786b09bcc3e445fb4"}`。実行範囲は上表/元manifest参照。
- charge-strike-execution.json: `{"index.html": "9adc15413ccfc9c1d4935b723a775ee3a17c8bd37c9bc341349f61a80878a15e", "hope-hammer-browser-adapter.js": "4dfb89eb5d03c2d66dddd3e0dd62cf7d75ec0a15735657faa63778ef9d138e2e"}`。実行範囲は上表/元manifest参照。
- water-conversion-execution.json: `{"index.html": "51ff8683e6205f55e4904668a790195e3a34ab9893f918a6a5b13ec05cd141a9", "hope-hammer-browser-adapter.js": "56ee0db62e9e3aa70bb8d8d08a0e5050db1f81b440ed774ad436210e23be9431"}`。実行範囲は上表/元manifest参照。
- water-combination-execution.json: `{"index.html": "51ff8683e6205f55e4904668a790195e3a34ab9893f918a6a5b13ec05cd141a9", "hope-hammer-browser-adapter.js": "d51f0b40bf71d55ad8a1a259d7af6e7cec093b90c106554f7c19f6afca6005f8"}`。実行範囲は上表/元manifest参照。
- water-conditional-execution.json: `{"index.html": "51ff8683e6205f55e4904668a790195e3a34ab9893f918a6a5b13ec05cd141a9", "hope-hammer-browser-adapter.js": "64e7a6c9767a51900bb2313f6bfe9349bb395566aa6151df18d3a94bb3bed37f"}`。実行範囲は上表/元manifest参照。
- conversion-sourai-execution.json: `{"index.html": "da1e4dd1def9f6c09f00d508f3607eacbef2409ce9580f09af99cfa4693ea49e", "hope-hammer-browser-adapter.js": "4fe916bd5ffe03b691bc6b7c21feb1fe01689f64fa43d14633113c511a55b3bb"}`。実行範囲は上表/元manifest参照。
- absorption-resistance-execution.json: `{"index.html": "8081801821a485b5468ed36dd33a43c605618c0c6224d511f92d510ad4c22fd3", "hope-hammer-browser-adapter.js": "defcc6096c17841fbf1743bc01748f42776fe1e72976e630fdc658e348ce6a45"}`。実行範囲は上表/元manifest参照。

## 合計と次の優先残件

{"火力非対象": 88, "完全接続": 58, "部分接続": 21, "固定ダメージ系・注釈のみ": 6, "欠落": 6}

今回は18行を監査訂正。製品実装増加0。C20のうち87/172は維持、B152/165も具体的な併用残件を分離して維持。

優先：152/165＋172rankIの健康枝別計画の合流。既存consumerに倍率/flat/capはあるが、変換側の解決済み系列検査に172が無い。既存健康枝契約だけで整合できるかを次の局所診断対象とし、今回guard解除は行わない。87は採用特殊referenceの攻撃倍率consumer対応を証拠へ結ぶ静的課題。新しい数値/技/状態の採用では解消しない。

竜撃弾順序・暗黒168満タン・SAED85/136の3提案は未採用のまま。
