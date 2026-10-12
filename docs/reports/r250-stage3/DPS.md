# 14武器STANDARD・DPS監査

正式絶対DPSの成立確認は0/14。全14件のライブMHDB実計算・対象版実機計測は未実施。「成立可能な武器が存在しない」という断定ではない。数値・時間・ビン回数補完なし。DB/Handler/計算コード変更なし。

## 共通経路

- 技数値：readCanonicalTechniqueRecord/techniqueDbHitsからTechnique DB。directCanonicalComboTechniqueは初期時間0/PENDING。legacy時間はLEGACY_REFERENCE_ONLY。withCanonicalTimingは版/fingerprint一致を要求してもUSER_MEASURED_REFERENCE。
- コンボ：calcDps/dpsForStats → evaluateComboRoute → comboTechniqueDamage。OrdinaryHitとChargeBladeHandlerのadapterを確認。Handler登録/availabilityと実計算接続は別。evaluateComboRouteは正時間でもREFERENCE_ONLY。
- 保存比較：compareSnapshot → standardPowerForStats → standardPowerForStatsSingleHealth。Generic STANDARD/Bow/HBG reference経路。comparisonPowerIndexの基準100相対指数とcomparisonDpsIndexは別の量。復元smoke成功は正式DPS成立ではない。
- Handlerは特殊成分の式・適用状態・回数を担当。本体MVを別正本へコピーしない。二重加算の実証は今回なし。登録一覧をコンボ接続済みと誤認する構造リスクあり。

| 武器 | 技/特殊成分の監査要点 | 正式DPS確認を阻む事項 |
|---|---|---|
| 大剣 | STANDARDの確認済MVあり | canonical時間未確認、参考時間と正式検証は別 |
| 太刀 | 赤状態STANDARDの確認済MV | 時間・状態条件の対象版検証 |
| 片手剣 | 確認済STANDARD技 | 一部時間0、全ルート時間検証不足 |
| 双剣 | 鬼人乱舞の部分検証/暫定採用 | 対象版実機状態・時間。登録参考時間はVERIFIEDでない |
| ハンマー | r234確認済MV群 | 一部canonical時間0、全ルート時間検証不足 |
| 狩猟笛 | 特殊Handler/EVIDENCE_GATED | 音波/響玉の式・イベント・コンボ接続・時間 |
| ランス | 確認済STANDARD技 | canonical時間0、正式ルート計測不足 |
| ガンランス | 本体技と砲撃/杭は別責務 | 特殊成分根拠・Handler接続・時間 |
| スラッシュアックス | STANDARD火力入口と確認済技 | STANDARD combo preset/接続・参考時間の区別 |
| チャージアックス | 解放I/II MVはPROVISIONALLY_ADOPTED/PARTIALLY_VERIFIED、実機PENDING | ビン回数null、放出ルート/時間未確定。推測禁止 |
| 操虫棍 | STANDARDはUNVERIFIED/出典競合/EVIDENCE_GATED | エキス状態・技根拠・時間 |
| ライトボウガン | 属性速射はHandler gate | 成分/単位/イベント/式・接続・時間 |
| ヘビィボウガン | 通常弾1hit referenceと属性gate | 単発reference≠全コンボDPS、属性成分/時間 |
| 弓 | 部分的reference/技根拠 | 距離/ビン/状態/対象版・Handler接続・時間 |

VERIFIED技でも時間/DPS全体が検証済みとは限らない。source_confirmedは出典確認、verifiedは明示版・条件の検証。暫定/未検証をまとめて確認済みにしない。

## 表示仕様不一致（P1）

spec/COMBAT_METRICS_DISPLAY.mdはACCEPTED（2026-10-08）。未検証DPSは数値表示せず理由を出す規則。evaluateComboRouteはREFERENCE_ONLYなのにcalcDpsが「実戦DPS」の数値と参考注記を表示し、dpsForStatsもpracticalDpsを返す。既存canonical-timing-browser.test.cjsはユーザー入力時間で数値表示を期待し、今回も現行挙動を検査して成功。緑テストは仕様不一致の解消を意味しない。

今回Task Cは監査として記録し、計算/DPS表示・期待値は変更しない。次工程で単独/保存比較/レポートの検証状態伝播と表示gateを最小再現し、ACCEPTED仕様へ整合する。参考DPS表示を残す別仕様案はユーザー承認が必要。異武器種の未検証数値比較不可。基準100補助値を非正規化主指標や正式DPSへ読み替えない。
