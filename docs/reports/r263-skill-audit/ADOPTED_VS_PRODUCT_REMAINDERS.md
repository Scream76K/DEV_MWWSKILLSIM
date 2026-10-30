# 採用済み接続と最終製品目標の分離監査
2026-10-29。新採用・範囲縮小・製品変更・テスト追加なし。既存採用資料と独立レビューに基づく文書訂正。

## 13 / 133 / 171: 部分→完全（採用範囲）

- 13: 災禍の既存通常/最大攻撃・属性倍率、共通cap、採用属性弾条件倍率、承認済み変換併用。 経路: standardPowerConditionPlan -> maximumElementComponents/ammoElementCondition -> adapter resolveEffects/referenceFormula -> common Formula/BowgunElementReference。根拠: PASS13_ELEMENT_CAP.md, CONDITIONAL_CONVERSION_CONNECTION.md。

- 133: 既存通常未発動/最大3被弾属性flat、近接/弓と変換用の明示吸収属性・最大耐性寄与。 経路: standardPowerConditionPlan / absorptionPlan -> L3 element flat and channel-local resistance conversion -> common Formula/BowReference。根拠: PASS13_ELEMENT_CAP.md, ABSORPTION_RESISTANCE_CONNECTION.md。

- 171: 明示調理結果による自己会心/武器属性flat、最新結果置換、共通属性capと保存共有条件。 経路: explicitAffinityState -> selfStatePlan -> common affinity/element flat -> adopted weapon Formula。根拠: HANDICRAFT_SELF_STATE_CHECKPOINT.md。

竜撃弾の一般条件属性/料理の専用属性は元から未採用の候補。PASS13の武器capを固定400/200へ転用しない。これを採用済み接続の必須条件とした前報を訂正。133の追加耐性入力は後続承認・実装・証拠を含む。171の既存証拠は武器基礎100+最新こんがり300=400であり調理結果累積ではない。

## 残り部分11・欠落6（全件を一度分類）
|ID/名|採用済み経路と残件種別|必要な根拠/承認・次作業|根拠|
|---|---|---|---|
|7 高速変形|SCOPE_OR_INPUT_DECISION: 既存変形/ED/AED前段は接続。SAED派生の高速変形対象本体/爆発と前段契約が未確定。|SAED派生を既採用効果対象とする根拠・対象Hit/前段の確定。既存倍率再承認不要。|ADOPTED_CONSUMERS_2_6_7_24.md|
|8 抜刀術【力】|SCOPE_EVIDENCE_INSUFFICIENT: 通常/弓/弾/SAED本体の明示Hit入力は接続。他特殊reference対象集合の採用記録不足。|未対応referenceの技ID/対象本体Hitを明示した採用根拠。未実行だけを欠落としない。|SAED_DRAW_BODY_CONNECTION.md|
|103 抜刀術【技】|SCOPE_EVIDENCE_INSUFFICIENT: 通常/弓/弾/SAED本体の明示Hit会心入力は接続。他特殊reference対象集合の採用記録不足。|未対応referenceの技ID/対象本体Hitを明示した採用根拠。時間生成不要。|SAED_DRAW_BODY_CONNECTION.md|
|18 無我の境地|EXISTING_INPUT_CONTRACT_UNRESOLVED: 黒蝕ありの明示感染/克服は接続。黒蝕なしに既存敵名推定経路が残る。|黒蝕なし感染/克服の明示条件契約。既存経路なので未採用拡張と断定して除外しない。|AFFINITY_SCOPE_STATIC_RECONCILIATION.md|
|53 弾導強化|SCOPE_EVIDENCE_INSUFFICIENT: 採用通常/属性弾・弓の適正距離物理+5は接続。既採用竜撃弾の適否不明。|竜撃弾の適用/非適用を示す根拠。現時点で対象外に縮小しない。|COMMON_FORMULA_CONSUMERS.md|
|66 攻めの守勢|EXISTING_COMPONENT_APPLICABILITY_UNRESOLVED: 本体条件倍率は接続。GL砲撃へ現consumerが倍率を渡すが適否未確定。|既採用GL砲撃の守勢適否。現挙動を保証済みとしない。|SHARED_ATTACK_CLOSURE.md|
|85 鈍器使い|SCOPE_EVIDENCE_INSUFFICIENT: 通常本体・GL砲撃除外は接続。特殊追撃/集約本体の適否に根拠不足。|採用特殊成分の対象/非対象の根拠。対象ならconsumerへ実装。|COMPONENT_SKILL_CHECKPOINT.md|
|136 心眼|SCOPE_EVIDENCE_INSUFFICIENT: 通常本体と肉質非依存成分の除外は接続。集約本体/追撃の適否に根拠不足。|元肉質を使う対象Hitと適用範囲の根拠。SAED本体へ推測適用しない。|COMPONENT_SKILL_CHECKPOINT.md|
|86 飛燕|EXISTING_TECHNIQUE_IDENTITY_UNRESOLVED: 採用DB対象Hitと地上技除外は接続。採用HAM_MIGHTY_CHARGE_UPPERCUTと原典除外の同定が未確定。|対象技同定/ゲーム確認。83の暫定承認を86へ流用しない。|HIT_SCOPE_CLOSURE.md|
|154 フルチャージ|EXISTING_CONDITION_COMBINATION_UNRESOLVED: 通常の満タン効果と172健康枝は接続。168暗黒との発動後回復/満タン共存が未確定。|168を併用した評価状態の明示承認。172と混同不可。|PARTIAL39_ACTION_MAP.md|
|168 暗黒|EXISTING_CONDITION_COMBINATION_UNRESOLVED: 既存単独効果は接続。154との発動後回復/満タン共存が未確定。|暗黒168の評価状態契約。既存係数再承認不要。|PARTIAL39_ACTION_MAP.md|
|23 速射強化|UNADOPTED_TARGET_TECHNIQUE: 通常非速射弾では非適用処理。適用側の速射技が採用技集合にない。|速射技/Hit/係数/状態の採用と実装。非適用成功だけで完全にしない。|NORMAL_AMMO_SKILL_EXCLUSIONS.md|
|69 特殊射撃強化|UNADOPTED_TARGET_TECHNIQUE: 通常弾では非適用処理。対象特殊射撃技未採用。|対象特殊射撃技と係数・入力の採用と実装。|NORMAL_AMMO_SKILL_EXCLUSIONS.md|
|94 貫通弾・竜の矢強化|UNADOPTED_TARGET_TECHNIQUE: 通常弾では非適用処理。対象貫通/竜の矢技未採用。|対象技のHit/係数/状態採用と実装。|NORMAL_AMMO_SKILL_EXCLUSIONS.md|
|159 焼き砲モロコシ|UNADOPTED_UNIT_AND_TARGET: 焼き砲の候補+3について内部/表示単位・対象砲撃未採用。|単位と適用動作の根拠/暫定承認。|EIGHT_SKILL_ADOPTION_CANDIDATES.md|
|163 刃鱗研装|UNADOPTED_COMPONENT_SCOPE: 刃鱗研装候補の物理/属性斬れ味適用契約未採用。|物理補正と属性補正の対象/値を分離した根拠/承認。|EIGHT_SKILL_ADOPTION_CANDIDATES.md|
|178 巨戟龍の黙示録|ADOPTED_VALUES_INPUT_CONTRACT_UNRESOLVED: 既採用I×1.2+20/II×1.3+40は維持。加算単位/成分/専用属性・弾への入力契約不足。|既採用値の単位・対象の確定。値を未承認に戻さない。|EIGHT_SKILL_ADOPTION_CANDIDATES.md|

上記部分11は、すべてが確定した配線欠陥という意味ではない。既採用技上の適否や既存条件の意味が未確定な行、対象境界の記録が不足する行を含む。今回は未採用拡張と明確に記録された13/133/171だけを訂正し、他行を自動昇格しない。欠落6は対象効果未実装であり、現在の採用技に適用先がない場合も最終製品目標の未達として残す。

## 集計と保全
最新分類: {"火力非対象": 88, "完全接続": 68, "部分接続": 11, "固定ダメージ系・注釈のみ": 6, "欠落": 6}
完全68/85は既存採用範囲の静的接続であり、全火力スキル・全技・実機の完成率ではない。新規製品改善0件、監査訂正3行。137/140/50の直前訂正は今回再計上しない。
旧実行証拠は各記録の対象hashのみ。今回はJSON/参照存在の整合確認だけ、製品コード・テスト再実行・Git操作なし。

更新：ID18は承認済み明示状態の実装・独立受入・保存2件共有条件確認により完全へ。上記18行は履歴。FRENZY_EXPLICIT_STATE_CONNECTION.md参照。最新分類 {"火力非対象": 88, "完全接続": 69, "部分接続": 10, "固定ダメージ系・注釈のみ": 6, "欠落": 6}。

## 暗黒168・フルチャージ154の受入反映
P2是正後独立レビュー受入に基づき両行を部分→完全（採用範囲）へ。71完全/8部分/6欠落/6注釈/88非火力、179行。今回2行は限定シナリオ実装で断絶を閉じた結果。満タン開始・途中回復・任意列・172/火事場との健康併用は未採用として保持。根拠:DARK168_PEAK_SCENARIO.md、dark168-health-execution.json。実機未検証、全体Doneではない。

## 受入済み限定6件の静的分類整合（最新）

独立レビューに基づき23/69/94/159/163/178のみ部分→完全へ訂正。71/14/0から **77完全・8部分・0欠落・6注釈・88非火力＝179**。77/85は採用範囲の静的接続率であり、新規実装件数・実機確認率・全体Doneではない。初回採用時の明示除外を維持し、範囲縮小なし。上記旧集計・旧経路なし記述は過去時点の履歴。

|ID|受入済み採用範囲・証拠|残す制限|
|---|---|---|
|23|通常Lv1速射1trigger5Hit、6/53併用を含む。[RAPID23_CONNECTION.md](RAPID23_CONNECTION.md), [rapid23-execution.json](rapid23-execution.json), [RAPID_NORMAL_UP_BALLISTICS_CONNECTION.md](RAPID_NORMAL_UP_BALLISTICS_CONNECTION.md), [rapid6-53-execution.json](rapid6-53-execution.json)|他弾種・反復・First/Force・抜刀等は未採用。暫定・現行実機未確認維持|
|69|通常千々矢1射6Hit、94との併用を含む。[THOUSAND69_CONNECTION.md](THOUSAND69_CONNECTION.md), [thousand69-execution.json](thousand69-execution.json), [THOUSAND94_CONNECTION.md](THOUSAND94_CONNECTION.md), [thousand94-execution.json](thousand94-execution.json)|属性・ビン・他特殊射撃等は未採用。暫定・現行実機未確認維持|
|94|通常千々矢、69との積1.26を含む。[THOUSAND94_CONNECTION.md](THOUSAND94_CONNECTION.md), [thousand94-execution.json](thousand94-execution.json)|貫通弾・竜の一矢は未採用。暫定・現行実機未確認維持|
|159|通常/溜め砲撃、物理と火加算分離。[CORNPOPPER_SHELL_CONNECTION.md](CORNPOPPER_SHELL_CONNECTION.md), [cornpopper-shell-execution.json](cornpopper-shell-execution.json)|FB等未採用。保存比較は1件。暫定・現行実機未確認維持|
|163|明示14技の無属性本体1Hit初回。[BLADESCALE163_FIRST_HIT.md](BLADESCALE163_FIRST_HIT.md), [bladescale163-execution.json](bladescale163-execution.json)|実行はGL_SLAM、他13技静的。属性/複数Hit/反復等未採用。暫定・現行実機未確認維持|
|178|五属性本体と既採用CB強属性ビン。[GOG178_CONNECTION.md](GOG178_CONNECTION.md), [gog178-execution.json](gog178-execution.json)|実行は合成GS/CB。属性弾・専用火等未採用。暫定・現行実機未確認維持|

JSONのadoptedScopeReclassificationHistoryへ旧現況を保存。各実行の対象hash・入力範囲・失敗履歴はリンク先manifestを維持し、今回の再実行はなし。製品/テスト無変更。残る部分は7/8/53/66/85/86/103/136。守勢GLはユーザーの翌朝実測待ちで適用可否を推測しない。
