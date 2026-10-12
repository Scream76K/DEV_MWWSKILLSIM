# KAN-11 Technique DB監査（Stage5）

2026-10-11、frieren（フリーレン）／01 CALC。AGENTS.md・roles/frieren.md読取確認。ユーザーのStage5許可に従い本報告と指定証跡のみ作成。

対象: /Users/scream/Projects/DEV_MWWSKILLSIM-r250、codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5（一致）。

## 結論と範囲

正式絶対DPS成立確認 **0/14**。成立可能な武器が存在しないという断定ではない。全14武器ライブMHDB実計算、実機動画照合、外部出典再取得は未実施。技数値は現行index.html内Technique DBのみを抽出し、数値確定・補完・VERIFIED昇格なし。

Stage3/DPS.md、Stage4/REPORT.mdを起点として現行実レコードを再抽出した。Stage4後のevaluateComboRouteは正式VERIFIED producerではなく、未検証DPS三値をnullにする。Stage3の参考DPS表示不一致は現行不具合として転載しない。

[実レコード全537件・evidence・状態・Hash](evidence/technique/runtime-records.json)。これは監査スナップショットであり数値正本ではない。欠落字段を証跡に創作追加しない。本表の欠落値はnull。Hit配列長は登録された本体Hit数であり、特殊イベント回数ではない。

## 14武器表

件数は各武器の全登録レコードで、STANDARD限定でも正式DPS件数でもない。V/P/UはverificationStatusのVERIFIED/PARTIALLY_VERIFIED/UNVERIFIED。PROVISIONALLY_ADOPTEDはnumeric/field statusでありV/P/Uと別軸。

|武器|全件 V/P/U|代表レコード/revision|MV配列 / 属性補正 / 登録Hit|版（baseline; validFrom）|代表状態・特殊成分|STANDARD/DPS不足|
|---|---|---|---|---|---|---|
|大剣|50: 3/33/14|GS_CHARGED_SLASH_3 / 3|[176] / [1.5] / 1|null; 1.040.00|VERIFIED; null; null|Generic READY。強薙ぎ払い等の時間未検証、旧時間は参考。|
|太刀|38: 3/35/0|LS_RED_BLADE_I / 1|[33,16] / [0.5,0.5] / 2|null; 1.042.00.02|VERIFIED; null; null|Generic READY。赤刃状態と全ルート時間の対象版検証不足。|
|片手剣|33: 4/25/4|SNS_DOWNWARD_SLASH / 2|[18] / [1.3] / 1|null; 1.020.00.00|VERIFIED; null; null|Generic READY。一部直接正規技の時間0、全ルート時間不足。|
|双剣|25: 0/23/2|DB_DEMON_DANCE_I / 3|[18,18,6,6,10,10,4,4,20,20,11,11] / [1,1,0.6,0.6,0.6,0.6,0.8,0.8,0.8,0.8,0.8,0.8] / 12|1.042.00.02; null|PARTIALLY_VERIFIED; PARTIALLY_ADOPTED; []|Generic READYはHP採用範囲。PARTIALLY_ADOPTED、実機PENDING。時間不足。|
|ハンマー|28: 4/24/0|HAM_SIDE_SWING / 2|[23] / [1] / 1|null; 1.011.00|VERIFIED; null; null|Generic READY。渾身等の直接技時間0。r234ジャンプMV採用は独立実測ではない。|
|狩猟笛|61: 2/22/37|HH_SELF_IMPROVEMENT_PERFORMANCE / 2|[35] / [1] / 1|null; 1.040.00|PARTIALLY_VERIFIED; null; ["PERFORMANCE_SHOCKWAVE"]|音波・響玉の式、イベント種/回数、Handler接続、時間不足。|
|ランス|32: 4/26/2|LAN_MID_THRUST_I / 3|[26] / [1.2] / 1|null; 1.040.00|VERIFIED; null; null|Generic READY。直接正規4技の時間0、正式時間不足。|
|ガンランス|50: 0/14/36|GL_SLAM / 1|[57] / [1] / 1|null; 1.042.00.02|PARTIALLY_VERIFIED; null; null|本体Hitだけでは砲撃/杭の全ルートを保証しない。特殊成分/接続/時間不足。|
|スラッシュアックス|42: 4/36/2|SA_SWORD_VERTICAL / 1|[33] / [1] / 1|null; 1.042.00.02|VERIFIED; null; null|Generic READY。STANDARD正規コンボpreset/直接技接続、参考時間との区別。|
|チャージアックス|35: 4/27/4|CB_ELEMENT_DISCHARGE_1 / 2|[51] / [1] / 1|null; 1.042.00.02|PARTIALLY_VERIFIED; PROVISIONALLY_ADOPTED; null|MV暫定採用とビン回数nullは別。専用コンボは剣→斧変形限定、放出/時間不足。|
|操虫棍|43: 0/27/16|IG_TRIPLE_SIDESTEP_SLASH / 4|[26] / [1] / 1|null; 1.040.00|UNVERIFIED; SOURCE_CONFLICT; null|SOURCE_CONFLICT、状態遷移TRIPLE_EXTRACT/NO_EXTRACT、時間、猟虫別成分。|
|ライトボウガン|31: 0/1/30|LBG_STANDARD_ELEMENT_AMMO / 1|[] / [] / 0|null; 1.042.00.02|PARTIALLY_VERIFIED; null; ["AMMO_PHYSICAL","AMMO_ELEMENT","RAPID_FIRE"]|属性/速射の弾単位・式・Hit/event・特殊Handler接続・時間不足。|
|ヘビィボウガン|33: 0/1/32|HBG_STANDARD_ELEMENT_AMMO / 1|[] / [] / 0|null; 1.042.00.02|PARTIALLY_VERIFIED; null; ["AMMO_PHYSICAL","AMMO_ELEMENT"]|属性全発の式/Hit/event/接続/時間不足。通常弾/最初1Hit参考は別範囲。|
|弓|36: 0/27/9|BOW_SHOT_3 / 1|[12,12,12] / [1,1,1] / 3|null; 1.042.00.02|PARTIALLY_VERIFIED; null; null|対象版/距離/ビンの独立検証、Handler接続、全ルート時間不足。|

合計537件: V=28、P=321、U=188。初回中間連絡の637は集計前誤記で、537へ訂正済み。DB_SPEC対象版は1.042.00.02。baselineが欠落する旧レコードは表でnullとした（DB全体版を個別baselineへ補完しない）。

## 代表レコードの根拠・特殊補正

### 大剣: GS_CHARGED_SLASH_3

- revision 3 / evidenceRefs: ["MACARONGAMEMO_GREAT_SWORD_VER1040"]
- stateRequirement: null
- partModifier: [1.2]。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: null
- currentVersionAudit: null / liveGameVerification: null / calculationStatus: null

### 太刀: LS_RED_BLADE_I

- revision 1 / evidenceRefs: ["MACARONGAMEMO_LONG_SWORD_MOTION_CURRENT"]
- stateRequirement: null
- partModifier: [null,null]。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: null
- currentVersionAudit: null / liveGameVerification: null / calculationStatus: null

### 片手剣: SNS_DOWNWARD_SLASH

- revision 2 / evidenceRefs: ["GAME8_2025_06_30_SNS_NERF","MACARONGAMEMO_SNS_VER1020_HISTORY"]
- stateRequirement: null
- partModifier: [null]。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: null
- currentVersionAudit: null / liveGameVerification: null / calculationStatus: null

### 双剣: DB_DEMON_DANCE_I

- revision 3 / evidenceRefs: ["KUROYONHON_DB_R50_CHECK","MACARONGAMEMO_DB_R48_SOURCE","ALGEST_DB_R51_STRUCTURE","USER_DB_R51_ADOPTION","MACARONGAMEMO_DB_R52_HISTORY","USER_DB_R52_ELEMENT_ADOPTION","MACARONGAMEMO_HP_FORMULA_R53","KUROYONHON_PART_DURABILITY_R53"]
- stateRequirement: {"demonMode":true}
- partModifier: [null,null,null,null,null,null,null,null,null,null,null,null]。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: {"motionValues":{"status":"ADOPTED","basis":"USER_ADOPTED_LATEST_SOURCE","evidenceRefs":["KUROYONHON_DB_R50_CHECK","USER_DB_R51_ADOPTION"]},"hitCount":{"status":"VERIFIED","value":12,"evidenceRefs":["KUROYONHON_DB_R50_CHECK","ALGEST_DB_R51_STRUCTURE","USER_DB_R51_ADOPTION"]},"elementModifiers":{"status":"ADOPTED","basis":"UPDATE_HISTORY_AND_INDEPENDENT_SOURCE_AGREE_USER_APPROVED","sourceVersion":"1.020.00","evidenceRefs":["MACARONGAMEMO_DB_R52_HISTORY","KUROYONHON_DB_R50_CHECK","USER_DB_R52_ELEMENT_ADOPTION"]},"partModifiers":{"status":"UNVERIFIED","reason":"PART_MODIFIER_NOT_REPORTED_IN_SOURCE"}}
- currentVersionAudit: PENDING / liveGameVerification: PENDING / calculationStatus: READY_ADOPTED_HP

### ハンマー: HAM_SIDE_SWING

- revision 2 / evidenceRefs: ["MACARONGAMEMO_HAMMER_VER1011"]
- stateRequirement: null
- partModifier: [1]。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: null
- currentVersionAudit: null / liveGameVerification: null / calculationStatus: null

### 狩猟笛: HH_SELF_IMPROVEMENT_PERFORMANCE

- revision 2 / evidenceRefs: ["MACARONGAMEMO_HH_MOTION"]
- stateRequirement: null
- partModifier: [null]。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: null
- currentVersionAudit: PENDING / liveGameVerification: PENDING / calculationStatus: READY_BODY_COMPONENT

### ランス: LAN_MID_THRUST_I

- revision 3 / evidenceRefs: ["MACARONGAMEMO_LANCE_VER1021","MACARONGAMEMO_LANCE_VER1040"]
- stateRequirement: null
- partModifier: [1]。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: null
- currentVersionAudit: null / liveGameVerification: null / calculationStatus: null

### ガンランス: GL_SLAM

- revision 1 / evidenceRefs: ["MACARONGAMEMO_GUNLANCE_MOTION_CURRENT"]
- stateRequirement: null
- partModifier: [null]。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: null
- currentVersionAudit: null / liveGameVerification: null / calculationStatus: null

### スラッシュアックス: SA_SWORD_VERTICAL

- revision 1 / evidenceRefs: ["MACARONGAMEMO_SWITCH_AXE_CURRENT"]
- stateRequirement: null
- partModifier: [1]。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: null
- currentVersionAudit: null / liveGameVerification: null / calculationStatus: null

### チャージアックス: CB_ELEMENT_DISCHARGE_1

- revision 2 / evidenceRefs: ["MACARONGAMEMO_CHARGE_BLADE_MOTION","KUROYONHON_CB_CURRENT","USER_CB_R236_PROVISIONAL_MV"]
- stateRequirement: null
- partModifier: [null]。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: {"motionValues":{"status":"PROVISIONALLY_ADOPTED","basis":"USER_PROVIDED_MEASURED_UPDATE_TABLE","sourceVersion":"1.020.00","baselineGameVersion":"1.042.00.02","evidenceRefs":["USER_CB_R236_PROVISIONAL_MV"]}}
- currentVersionAudit: null / liveGameVerification: PENDING / calculationStatus: null

### 操虫棍: IG_TRIPLE_SIDESTEP_SLASH

- revision 4 / evidenceRefs: ["MACARONGAMEMO_INSECT_GLAIVE_CURRENT","GIFTED_AUK410_IG_VER1040"]
- stateRequirement: {"tripleExtract":true}
- partModifier: [null]。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: null
- currentVersionAudit: null / liveGameVerification: null / calculationStatus: EVIDENCE_GATED

### ライトボウガン: LBG_STANDARD_ELEMENT_AMMO

- revision 1 / evidenceRefs: ["MACARONGAMEMO_BOWGUN_BULLETS"]
- stateRequirement: null
- partModifier: []。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: null
- currentVersionAudit: null / liveGameVerification: null / calculationStatus: null

### ヘビィボウガン: HBG_STANDARD_ELEMENT_AMMO

- revision 1 / evidenceRefs: ["MACARONGAMEMO_BOWGUN_BULLETS"]
- stateRequirement: null
- partModifier: []。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: null
- currentVersionAudit: null / liveGameVerification: null / calculationStatus: null

### 弓: BOW_SHOT_3

- revision 1 / evidenceRefs: ["MACARONGAMEMO_BOW_MOTION_CURRENT","BOW_R112_SOURCE","BOW_R112_ELEMENT_SOURCE"]
- stateRequirement: null
- partModifier: [null,null,null]。部位耐久補正をHPへ転用しない。
- specialSourceValues: null
- fieldVerification: null
- currentVersionAudit: SOURCE_REFERENCE_NOT_LIVE_VERIFIED / liveGameVerification: PENDING / calculationStatus: null

## r234–r236歴史資料の再照合

RELEASE_r234.mdと現行HAM_JUMP_CHARGE_1/2/3を照合: revision2、MV72/77/88、旧65/70/80はrevisionHistoryに保存。MV field=ADOPTED、sourceVersion1.011.00、baseline1.042.00.02、liveGameVerification=NOT_MEASURED、全レコードはPARTIALLY_VERIFIED/EVIDENCE_GATED。属性/スタンの実機未確認をMV履歴採用で解消しない。これらはSTANDARDの横振り等とは別技。

RELEASE_r235.mdは牽制/斬り返し暫定MV採用を記録するが、現行CB_SWORD_WEAK_SLASH/CB_SWORD_RETURN_SLASHはSOURCE_CONFLICT/UNVERIFIED。リリース文書だけで正式VERIFIEDへ昇格しない。

CHARGE_BLADE_MEASURED_MV_r236.jsonのsourceVersion=1.020.00、status=PROVISIONALLY_ADOPTEDを現行配列と照合: 放出Ⅰ[51]、Ⅱ[25,58]、SAED[16,78,45]。放出Ⅰ/ⅡのみnumericStatusとMV字段がPROVISIONALLY_ADOPTED、verificationStatus=PARTIALLY_VERIFIED、liveGameVerification=PENDING。CB_SAEDは配列採用後もSOURCE_CONFLICT/UNVERIFIED/EVIDENCE_GATED。現対象版1.042.00.02との独立照合不足。ビン回数5技は全てcount=null/CANDIDATE、暫定回数レジストリ空。MVとビン回数を混同しない。

## 出典確認の限界

抽出evidence registryでresolveできない旧evidenceRefsが23種類ある（例MACARONGAMEMO_GREAT_SWORD_VER1040、MACARONGAMEMO_CHARGE_BLADE_MOTION）。他の埋込旧資料・定数に出典が存在し得るため「出典が不存在」と断定しない。今回外部原資料の再照合は未実施。source_confirmedは出典採用状態であり対象版実機verifiedではない。VERIFIED28レコードにもbaseline/live字段欠落があり、対象版・実機条件・時間が証明されたとは扱わない。

## 経路・責務・重複リスク

- Technique DB唯一入口: techniqueDbHits（index.html:5284）、readCanonicalComboHits。特殊成分・状态・字段gateを維持。
- 保存比較: compareSnapshot→standardPowerForStats→standardPowerForStatsSingleHealth。buildComparisonRouterの専用Handler登録とは別経路。Generic READY7武器/IG evidence gate、Bow/HBG通常弾は限定参考経路。
- コンボ: calcDps/dpsForStats→evaluateComboRoute→comboTechniqueDamage。接続adapterはOrdinaryHitとChargeBladeHandlerのみ。登録Handler一覧を接続済みと解釈しない。
- 普通HitはgenericProfileDamage共有、コンボはHitごとの丸め後集計。CBコンボは専用resolverで条件検査した後、成分をdamageFromParamsで再計算する。二重加算の実証なし、経路間丸め/適用差は追加検証事項。HandlerへMVの別正本を作らない。
- directCanonicalComboTechnique時間初期0/PENDING、旧時間LEGACY_REFERENCE_ONLY、withCanonicalTiming適合登録でもUSER_MEASURED_REFERENCE。全ルート正式時間未確認。
- evaluateComboRoute（4025）はdpsStatus BLOCKED/TIMING_PENDING/UNVERIFIEDでDPS三値null。compareSnapshot、comparisonDpsValueはVERIFIEDと有限値を要求。文字列gateは正式producer/証拠検証の代替ではない。
- comparisonPowerIndexは同武器・同profileの基準100相対STANDARD。非正規化powerIndex/maximumと正式絶対DPSは別量。

## 実施・検証・変更・次案

新実行: Node24.19.0/jsdomで指定indexとローカルscriptをメモリ読取、fetch拒否、現DB537件をJSON抽出。最初の抽出はGeneric profile getterのIG gate例外で終了1（書込前）。getterをserializeせずprofile metadataを抽出した2回目は終了0。監査JSONのみ書込。Nodeスイート/ライブMHDB/実機計測/外部出典再取得は未実施。既存Stage4テスト成功は独立計測成功として加算しない。

変更ファイル: TECHNIQUE_AUDIT.md、evidence/technique/runtime-records.jsonのみ。製品/DB/既存tests変更0、Git変更操作0、原本/GUILDアクセス0、再委任0。

P1: 各武器の対象版・全成分・状態・回数・全ルート時間の証拠契約を作り、正式producer導入前にfern/heiter/serieで照合。CB sourceVersion差/SAED未検証/回数null、IG出典競合、特殊Handler接続は先行阻害。P2: legacy evidenceRefs解決、経路別丸め/成分重複の最小試験。数値補完/独断採用は行わない。

統合提案: 監査文書・証跡の統合可。正式DPS成立・リリース可・全14武器ライブ検証済みの宣言不可。

現行根拠行: readCanonicalComboHits:3719、chargeBladeComboDamage:3835、evaluateComboRoute:4025、CHARGE_BLADE_PROVISIONAL_PHIAL_COUNTS:4757、techniqueDbHits:5284、buildComparisonRouter:6711、standardPowerForStatsSingleHealth:6957、standardPowerForStats:7021、comparisonPowerIndex:7044、compareSnapshot:7089、comparisonDpsValue:7183。

検証: 証跡JSON parse成功、武器キー14、レコード537、報告表14行・代表14件を確認。
