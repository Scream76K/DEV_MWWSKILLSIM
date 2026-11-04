# ゼーリエ引き継ぎ｜UI開発（2026-11-04）

## 1. 版の識別（最重要）
- Repository: `Scream76K/DEV_MWWSKILLSIM`
- **旧UI統合基準**: branch `flamme/ui-integration-latest-20261103`, SHA `3096b71293f22ff1835214fc941a6431cdacf8a0`。2026-11-04にGitHub上のHEAD一致確認。
- **現UI開発成果**: Draft PR [#3](https://github.com/Scream76K/DEV_MWWSKILLSIM/pull/3), branch `flamme/ui-unresolved-reason-display-20261104`, 引継ぎ前SHA `f4703708656d63c4e9a9b7e784ad6fb4fbaf70c3`。旧基準から ahead 25 / behind 0 を確認。
- この文書の追加コミットでHEADは進む。実装比較には `f470370`、以後の作業開始には本ドキュメント追加後の実HEADを用いる。
- `3096b71` を現行UI最新版として上書きしない。PR #1/#2は別Draft。未承認のmerge/rebase/公開をしない。

## 2. 引き継ぎ経緯
1. 2026-11-03、Macで表示したUIが前回の最新版ではないとの指摘。複数の起動・ポート確認が続き、SHA管理と実画面一致、修正成果不足が問題となった。
2. `docs/ui-integration-20261103-handoff.md`, `tests/ui-build-workflow-contract.test.cjs` を確認。上位Build/Supportと内部Armor/Skillは**別レイアウト契約**。
3. KAN-18にはiPhone内部ビルド/スキル **6:4** の退行を記録。KAN-63 11/01には上位Build/Supportについてスマホ縦、横タブレット・PC横を基本とするオーナー指示を記録。別DOMの適用範囲を混同しない。
4. 本チャットで旧 `3096b71` を想定した `apply_ui_layout_fix.cjs` と `check_ui_layout.cjs` をローカル作成したが、**現行PR #3には未適用、未検証・未採用**。旧CSS上書きの重複・テストの外部読み込み遮断の懸念があるため、**両ファイルを勝手に適用・統合しない**。
5. Jiraを再確認してPR #3に既存25コミットの改善があると判明。現行PR #3を継続レビューする方針に修正。

## 3. PR #3に存在するUI実装（Jira・GitHub差分から）
- `renderSummary()`: 通常/最大を独立表示。片側保留でももう片側の非正規化実値を小数1桁で表示。未算出理由を短い日本語に変換し、技術識別子は詳細に保持。0推測補完なし。
- 防具部位SVGをCSSで見やすく拡大（基本40×46px、430px以下34×40px）。アイコン**図柄自体**はオーナー未承認。
- 旧r120/v7.2.xバナー、古いDPSの過大案内を整理。11/03のオーナー決定は**DPS開発中止**、火力は時間なしの固定コンボ単純加算。
- 上位Build/Supportの981〜1120pxで残った1.65:1を50:50に修正。<=980pxは縦積み、1024/1440pxは上位50:50。これはiPhone内部6:4検証とは別。
- 監査・笛・灼熱化・龍属性参考の4パネルを、DOMとハンドラは残したまま一般画面で非表示。報告のChromium比較でBuild開始位置は1440px約421→202px、375px約521→303px。
- 保存A/Bの案内文を実計算値、未算出理由、再保存の現行説明に短縮。計算/DB/保存状態ロジックの変更は報告されていない。
- 主要差分7ファイル: `.github/workflows/ui-pr3-layout-smoke.yml`, `index.html`, `tools/ui-pr3-layout-smoke.cjs`, `tests/ui-unresolved-damage-presentation.test.cjs`, `ui/unresolved-damage-presentation.browser.js`, `ui/unresolved-damage-presentation.cjs`, `docs/reports/ui-unresolved-reason-display-20261104.md`。

## 4. テストの証拠と残ゲート
- Jira記録はGitHub Actions `41827105661`, `41827730221`, `41828241567` を SUCCESS と報告。APIで `41828241567` は completed/success を確認。ただしこのrunの対象SHAは `97434eb18f72cbd324a7569fcabc1ea443ec0d89` で、引継ぎ前PR HEAD `f470370` とは異なる。**新HEADに対する全CI成功と同一視しない**。
- 375/390/768/1024/1440pxの実Chromiumスモーク、スクショ、ページ横はみ出しなしは既存証拠あり。Safari/iPhone/iPadの実機受入は未実施。
- 実MHDB装備ロード後のアイコン形状、異なる装備A/B保存/読込/比較/個別復元、通常/最大の4状態（両算出・片側ずつ未算出・両未算出）、iPhone内部6:4での実表示/操作は受入保留。
- 過去のGS Artia数値は固定fixtureの回帰参照。今回の実測証明ではない。β公開、main/develop統合、UX最終受入も未承認。

## 5. 仕様衝突を勝手に解消しない
- 上位Build/Support: スマホ縦、横タブレット・PC左右、PC基本50:50。
- 内部Armor/Skill: KAN-18はiPhone 6:4を明記。他方KAN-63の11/01コメントには可読性・実幅優先と「スマホでは縦積みに切替」の記載もあり、同じDOMを指すかは未確定。**対象セクションを区別し、実機のオーナー判断を得る**。旧スクリプトで一律に上書きしない。
- MHDB/Technique DB・採用スキル・通常最大独立・非正規化主表示を保持。固定コンボは丸め前の実ダメージ単純加算。DPS/時間比/平均は新規導入しない。
- 「同内容を2保存」と「異なる装備のA/B比較」は区別する。未算出理由を推測値や0に置き換えない。

## 6. ゼーリエの次アクション
1. **PR #3の新HEADを再取得**し、7ファイル差分、CIの対象SHA、PNG/JSONを再確認。旧 `3096b71` から開発をやり直さない。
2. 5幅の実画面を再レビューし、上位Build/Supportと内部Armor/Skillを分離して計測。Mac/iPhone Safari・横iPadで実操作を確認。
3. 通常/最大の4状態、実MHDB装備と部位アイコン、異なる装備A/B保存/復元、比較を操作検証。
4. KAN-18とKAN-63の配置表現の差をオーナー承認事項として扱う。必要な局所UI修正のみ行い、計算/DB/保存ロジックを保護。
5. 技術受入・オーナーUX受入・公開Goを分離し、Draft PR #3を当面 HOLD_MERGE とする。

## 7. 参照
- [PR #3](https://github.com/Scream76K/DEV_MWWSKILLSIM/pull/3)
- [KAN-18](https://harasworkspace-36774503.atlassian.net/browse/KAN-18)
- [KAN-63](https://harasworkspace-36774503.atlassian.net/browse/KAN-63)
- [KAN-44](https://harasworkspace-36774503.atlassian.net/browse/KAN-44)
- `docs/ui-integration-20261103-handoff.md`
- `docs/reports/ui-unresolved-reason-display-20261104.md`

**本コミットは引き継ぎ文書のみ。製品コード変更・新規ブラウザPASS・mergeを主張しない。**
