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
