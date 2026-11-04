# UI未算出理由の日本語表示 — 独立実装・接続条件（2026-11-04）

## ベースと目的
- UI基点: `3096b71293f22ff1835214fc941a6431cdacf8a0`
- 対象: 2026-11-03オーナー実機UI指摘、KAN-18 / KAN-26 / KAN-63
- 開発中の正本UIや火力計算に影響させず、未算出の内部識別子を利用者向けの短い日本語に変換する**表示専用**モジュールを追加する。

## 実装
- `ui/unresolved-damage-presentation.cjs` は結果の `status` / `reason` を読み、`summary` と `technicalReason` を返す。
- 未算出は未算出のまま保持。0を代入せず、`value` を新たに構築しない。
- `REAL_SLICE:` 等の技術識別子は通常表示の要約には埋め込まない。原文は開発者詳細へ残す。
- 不明コードの推測翻訳は行わず、一般的な「保留中」表示と技術詳細を分ける。
- 正常値（`status:'available'`）には未算出警告を追加しない。

## UI接続条件（まだ未実装）
- 実計算とA/B比較の結果オブジェクトを変更せず、**描画直前だけ**要約モデルを参照する。
- `<details>` 等の開閉式の開発者詳細に `technicalReason` を表示し、通常画面へは `summary` だけ表示する。
- 通常/最大を独立処理する。片側だけ未算出ならもう一方を隠さない。
- A/B保存、ロード、比較表、診断JSONへの原データを改変しない。
- PC 50:50、横タブレット2カラム、スマホ縦積みを保つ。
- テスト幅：375/390/768/1024/1440px。Safari実機で未算出/計算済み/片側だけ保留を確認する。

## 現状判定
- 新規表示モジュールとテストのみ実装。GitHubの元UI `index.html` は変更していない。
- 7件のテストコールバックは独立JavaScript実行で通過。ネイティブNodeおよび実ブラウザ実行は未確認。
- 完了/β承認とはしない。PRのレビュー・別途UI接続後に判定する。

## 実Node.js検証（2026-11-04）
- GitHubのソースとローカル実行対象をGit blob SHAで照合：`ui/unresolved-damage-presentation.cjs` = `bcb2b46b12fdea2dfca4cfe5806fc223a5287e4b`、`tests/ui-unresolved-damage-presentation.test.cjs` = `f6b654182b33b79ba18e58716c5ad8ce1ba8df73`。両者完全一致。
- Node.js v22.16.0の正式`node --test tests/ui-unresolved-damage-presentation.test.cjs`：**7 PASS / 0 FAIL**。
- これは新規表示モジュールの単体検証であり、既存`index.html`描画、Safari、保存A/B、実MHDBの統合検証ではない。
- UI本体は未変更、Draft・レビュー保留を維持。
