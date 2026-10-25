# 散弾Lv2：採用前照合

対象製品0ba6295ba2133b3a41bd2effe941b0fb7d1c5f15。製品変更・テスト実行・gate解除なし。調査日2026-10-25。

## 承認状態
index.html:5689 HBG_SPREAD_AMMO_2 / LBG_SPREAD_AMMO_2はMV15.6、Hit6をspecialSourceValuesに持つ。numericStatus SOURCE_CONFIRMED、verificationStatus UNVERIFIED、calculationStatus EVIDENCE_GATED。未達はSPECIAL_FORMULA_AND_EVENT_COUNT_PENDING、OFFICIAL_BASELINE_VERSION_AUDIT_PENDING、WEAPON_AMMO_APPLICABILITY_PENDING。DB baseline1.042.00.02は検証証拠ではない。docs/reports/kan-17-ranged/REPORT.md:19は散弾を対象外と明記。検索したdocs/reports、docs/superpowers、関連git commit subjectsに散弾採用記録は見つからず、source-confirmedをowner-approvedと解釈しない。

## 原典照合
https://macarongamemo.com/entry/mhwilds-bowgun-bullets （取得表示2025-06-29更新、今回再確認）表Lv2散弾は15.6×6。距離は近距離0.1/適正1/遠距離0.1。LBG専用物理補正0.7、速射0.55、チェイス0.85等は別欄。HBG通常/竜熱モード係数欄はあるが最初の採用をLv0に限ればその追加展開を避けられる。Ver1.011.00履歴にはMV12.65→15.6がある。現行ゲーム版一致の実測は未実施。

https://kuroyonhon.com/mhwilds/program/skill.php 散弾・剛射強化Lv1行は対象物理1.05倍。MHDB正式id2、散弾珠【３】id246、武器slot3。既存index.html:5782の1.05は弓BOW_POWER_SHOT_3/BOW_POWER_VOLLEY_3限定の採用データなので、そのスコープを勝手にボウガンへ拡張しない。

## 実経路
hope-hammer-browser-adapter.js:105 referenceKindはHBG/LBG通常弾だけ。散弾はhits空なので同136のTECHNIQUE_HITS_NOT_FOUND。復元なしなら容量scope gateは通過するが、技側保留は残る。復元の全弾種対応を先にする必要はない。
同41/60のclassifySkill/referenceSkillsは散弾強化を取得するが、bowgun-normal-reference.js:shotはnormalUpのみでspreadUpを使わない。弓式bow-reference.js:48だけがspreadUpを使う。単に引数を渡すだけでは未接続。
共通sourced-physical-formula.cjs:physicalはattack/会心/肉質/MVを既存calculateへ渡すが斬れ味を必須解決し、距離/散弾強化/射撃モード引数はない。近接式へ6Hitを注入して斬れ味や武器属性を適用する方法は不適切。既存referenceFormulaルートで弾専用計算を共有し、ゲーム数値はTechnique DBから読む構成が候補。FormulaやPipelineの複製は不要。

## 推奨する最小暫定採用範囲（まだ実装しない）
HBG_SPREAD_AMMO_2、MV15.6×6、全6Hit同一肉質に命中、適正距離、通常モードLv0、復元なし。物理/会心/弾肉質/散弾強化Lv0または1だけ。斬れ味・武器属性・LBG0.7・速射・チェイスは適用しない。現行版未検証・資料参考の暫定採用として結果に残す。LBGは別の採用範囲としHBG係数を転用しない。

合法な最小候補: 実HBG523のslot3へ散弾珠246を無し/有り。原典Lv2散弾capacity3、真攻撃190+承認済み生産15=205、会心5%、スキルなし→正式id2 Lv1。訓練場弾肉質80%、超会心なしの期待値は1Hit=205×0.156×0.8×(1+0.05×0.25)=25.9038、6Hit計155.4228。珠有りは1Hit27.19899、計163.19394（物理のみ1.05倍）。これは採用時の検証期待値であり製品実行結果でもゲーム実測でもない。丸め方も実装契約で明示する。

## 次の独立作業
承認前でも原典ID/装備スロット/スキル集計の対応確認は可能で、candidate-input.jsonに原典レコードを保存済み。既存通常弾の攻撃/会心/肉質集計と共通入口を再利用する方針まで確定。数値ゲート解除を伴わない通常スキルの分類/適用先照合は独立に続行可能。散弾の火力完成に関しては上記範囲の暫定採用判断が必要であり、既存承認を発見したとは報告しない。
