# 初回調査タスク台帳

全タスク：読み取り専用、製品/DB/既存テスト/設定/報告ファイルの変更0件、index.htmlロックなし、成果はヒンメルが文書化。基準は現在の未コミット統合状態でHEADだけとは異なる。

| task_id | 担当 | 目的 | 状態 |
|---|---|---|---|
| ORG-01 | frieren | 保存ビルド比較の計算依存関係と実MHDB検証計画 | 起動・回収済み |
| ORG-02 | stark | 比較画面の構造・UI改善候補 | 起動・回収済み |
| ORG-03 | heiter | Technique DB暫定値とテンプレート監査 | 起動・回収済み |
| ORG-04 | fern | 回帰テストと未実施領域 | 起動・回収済み |
| ORG-05 | eisen | index.htmlの依存責務・変更競合箇所 | 起動・回収済み |
| ORG-06 | sein | 旧OCR11件の失敗原因分類 | 起動・回収済み |

起動ID、結果回収、重複/矛盾整理はRUN_REPORT.mdに記録。書き込みタスクへ切り替えるには新規依頼で許可パス、基準ハッシュ、担当ロック、仕様承認、必須回帰を確定する。

第2段階：himmelが13件調査、OCR最小修正と回帰更新。seinが旧OCR後段、fernが実画像検証経路、eisenが独立レビュー。実行証拠はdocs/reports/r250-stage2/REPORT.md。

## r250 第3段階

編集ロック：index.htmlはhimmelのみ。sein OCR経路、stark確認UI、heiter SALADA/MHDB、frieren 14武器DPS、fern回帰/並列、eisen独立レビュー、serie品質ゲートを読取委任し、全7担当から回収済み。結果はdocs/reports/r250-stage3へ統合。共有FSの独立編集分離は実施していない。

承認：根拠付き最小不具合修正はユーザー指示内。実画像golden未確定、数値/座標の推測変更禁止を維持。commit/push/PR/merge/rebase/公開は未承認・未実施。

## 2026-10-25 限定修正の引継ぎ

SERIE-STATE-CONNECTION: オーナー2026-10-25 14:46 UTC承認によりserieが担当。基準8338ab0、開始時の4ファイル差分を保持。対象index.html（MHWeaponEffectDBのみ）、hope-hammer-browser-adapter.js、min8/engine.cjsと生成bundle、限定検証tools/serie-state-connection-proof.cjsおよび証拠。弓3射列・SA属性順のみ。SA1.45はOWNER_APPROVED_PROVISIONAL、現行版未検証。ローカルcommit可、push/merge/公開不可。index.htmlの担当はこの限定修正のみ引継ぎ、完了時返却。

SERIE-STATE-CONNECTION completed: product commit 119abbb0a73807f498cef83311f0983e4bdb4fef. Evidence: docs/reports/r252-state-connection/. Limited index.html edit ownership returned.

SERIE-BOW-REAL-AB: owner continuation 2026-10-25T14:55Z; base05c1565; serie owns adapter skill-name mapping and tools/bow-real-saved-comparison-proof.cjs plus docs/reports/r252-bow-real-ab. No index.html, snapshot policy, Artia, or other weapon formula changes.

SERIE-BOW-REAL-AB completed: product 01c18a568a5ba0e666d537bcd2300e6cc759fe4c; evidence docs/reports/r252-bow-real-ab/. Adapter edit ownership returned.

SERIE-BONUS-BOUNDARIES: base003b7c2, continuation approved. Limited ownership: index.html hpRelevantBonusEffects, adapter non-damage skill classification, tools/bonus-boundary-saved-comparison-proof.cjs and docs/reports/r252-bonus-boundaries. Real MHDB series1/2/4 and group2/3 only; no Artia edits or other-weapon reruns.

SERIE-BONUS-BOUNDARIES completed: product 04c424bb7e5c2f6fa5aad146bf7db0b52df6cf35; evidence docs/reports/r252-bonus-boundaries/. Limited index.html/adapter ownership returned. Existing Artia material-selector discrepancy reported without edits.

- 2026-10-25 serie: オーナー承認の継続委任。index.htmlのアーティア素材UI・正規化・単独/比較入力に限定編集。旧保存境界の最小実MHDB検証完了、他担当との編集競合なし。詳細 docs/reports/r253-artia-fixed-production/REVIEW.md。
- 2026-10-25 serie 夜間継続: 通常Ⅰ/Ⅱと巨戟の判定を分離、未接続の通常計算を明示保留。新数値の版・採用判断は docs/reports/r253-base-artia-source/MORNING_DECISIONS.md。数値接続は未完了。1代表の安全境界のみ確認。
- 2026-10-25 serie: 通常スキルの独立夜間作業。Adapterのファーストショット正式名未接続のみ修正。実HBG467/珠358の初弾と2発目で公開calcBuild/通常最大/表示確認。保存比較・全体回帰なし。アーティア未確定数値は保留維持。
