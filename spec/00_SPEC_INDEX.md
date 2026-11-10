# モンハンワイルズシミュレーター 仕様の入口

更新: 2026-11-10 / SPEC-20261110-01

現行の承認済み契約・上書き履歴・実装差分は **[CURRENT_CONTRACTS.md](CURRENT_CONTRACTS.md)** を参照する。最新版のユーザー指示が常に優先する。

- 仕様決定と製品への実装・検証・公開状態を区別する。
- r139の文書、旧STANDARD、過去の受入ログだけで現行仕様を決めない。
- MHDBとTechnique DBの数値正本は維持し、ここへ複製しない。
- 下記は2026-10-08の履歴。旧『現行のみ』『CURRENT CONSOLIDATION』は当時の表示であり、現在の状態ではない。

## 履歴: r139仕様索引（原文保持）

# モンハンワイルズシミュレーター 現行仕様インデックス
Revision: r139 / 2026-10-08
Status: CURRENT CONSOLIDATION — 実装済み・確定・未検証を区別

このフォルダは **現行の仕様のみ** を機能別に再整理したもの。過去Revisionの個別仕様書、リリース履歴、実験記録は収録しない。
優先順位: ユーザーが明示的に確定した仕様 > 現行ゲーム版とMHDBの確認済みデータ > 検証済みTechnique DB > 未検証参考資料。資料同士が矛盾した場合は推測で解決せず保留。

- 01_DATA_AND_EQUIPMENT.md: MHDB・装備・護石・装飾品・スキル
- 02_OCR.md: OCR・9行グリッド・画像座標
- 03_TECHNIQUE_AND_DAMAGE.md: Technique DB・火力計算・検証条件
- 04_COMBO_AND_DPS.md: 技・コンボ・DPS
- 05_COMPARISON_METRICS.md: 非正規化火力・保存ビルド比較【確定・最優先】
- 06_UI_AND_STORAGE.md: UI・保存・GitHub Pages
- 07_BUILD_TEMPLATES.md: テンプレDB・情報源・検証
- 08_EVIDENCE_AND_GATES.md: 未検証項目・動画検証・回帰テスト
- 09_SOURCE_AND_STATUS.md: 仕様根拠・未網羅領域

注: これは現存するr139コードと資料から作った現行仕様の統合版であり、全機能が実装完了・実機検証済みという意味ではない。コードとの差異が判明した場合は差分として記録する。
