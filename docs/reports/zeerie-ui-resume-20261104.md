# ゼーリエ UI再開検証（2026-11-04）

対象: Draft PR #3 / `a0b60f39fa5798a371ad0dad56f5f3e9e2c253ab`。
作業場所: `/Users/scream/Documents/Codex/2026-11-04/task/ui-resume`。
ローカルブランチ: `zeerie/ui-resume-20261104`。未commit・未push。

## 基準と保全

- GitHub PRメタデータとfetchのHEADが一致。旧3096b71は比較基点のみ。
- GitHub最新HEADのCI: [41849556827](https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/41849556827) completed/success。今回の未commit差分のCI成功ではない。
- developはfetch後 `8ba21ea9915e44421e89ae0a33fc7a4c5adcb1ae`、対象HEADとの比較は behind 0 / ahead 396。
- 元の `/Users/scream/Projects/DEV_MWWSKILLSIM` はdevelopと未追跡画像があるため無変更。既存worktreeにも変更なし。書込可能な専用cloneで実施。
- AGENTS.mdを確認。ユーザーの最新委任に従い局所UIを編集。旧未検証CSSスクリプトは使用していない。

## 今回の局所修正

1. `index.html`: 選択技の実計算のラベルと本文を縦に並べ、通常／最大の値・保留理由にパネル幅を渡す。1440px時の本文幅156.625→255.625px、390px時231→330px。
2. `index.html`: 現在装備の表の部位名を36px確保し、武器／護石が1文字ずつ縦折れする問題を解消。値側は折り返し可能。
3. `index.html`: ⑦の見出しと参照先を「コンボ火力」に統一。説明を単純加算方針・DPS開発中止・未対応保留の案内に変更。既存DPSロジックを新規開発・有効化していない。内部の旧DPS説明・コントロール全体の整理は今回未実施。
4. `tests/ui-build-workflow-contract.test.cjs`: 既存2件の失敗原因は、ループで生成される比較行の属性を静的なリテラルとして探していたこと。通常／最大の実際の定義を検査するよう整合。実ブラウザでも生成行の存在を確認。

全inline scriptをHEADと比較し、3箇所の⑦案内文字列以外は一致。外部計算モジュール、DB、保存ロジックは無変更。

## 検証結果

- UIの対象Nodeテスト: 28/28 PASS（修正前26 PASS、上記旧期待値2 FAIL）。
- 保存状態保全 `tests/r250-snapshot-ownership.test.cjs`: 5/5 PASS。
- 既存 `tools/ui-responsive-browser.test.cjs`: 親テスト込み8/8 PASS。375/390/768/980/1024/1120/1440pxの上位配置・横はみ出し・保存ボタン位置。
- 基準HEADの既存5幅スモーク: 全幅PASS。四つの開発参考パネル非表示も確認。
- MHDBを実ブラウザの「最新データを取得」で取得: skills179 / armor714 / decorations361 / charms64 / sets194 / weapons1160 / monsters34。全dataset status=ok。
- 実データ取得後、武器と全5防具を選択し375/390/768/1024/1440pxを撮影。防具アイコンは375/390で34px、他幅40px。図柄のオーナー受入は別。
- 同じ取得データをメモリに再現して修正前後を測定。新CSSの理由文・部位名幅チェックは修正前FAIL→修正後PASS。全5幅でdocumentWidth=viewportWidth。
- 異装備A/B: A=頭516「アーティアヘルムα」、B=頭600「アーフィヘッドα」。UIで保存・比較し、編集中スナップショットが比較後も一致。Bの同内容別名保存を別途確認。
- A読込キャンセルはBを保持。A/B各復元は保存時スナップショットと一致。ページ再読込後、取得データをメモリへ再投入し、保存3件が残りAを復元できることを確認。
- 通常／最大の両算出・片側ずつ保留・両保留を実際のrenderSummaryへ合成結果を注入して表示確認。これは表示層検証であり、実計算4状態の受入ではない。
- `git diff --check` PASS。大規模全スイートは依頼に従い未実行。

## 外側と内側の配置・残ゲート

- 外側Build/Support: <=980px縦、>=981px横。1024/1440pxは50:50。今回変更なし。
- 内側Armor/Skill: <=1120px縦、1440pxでは約396:294。iPhone 6:4への一律復元はしていない。KAN-18とKAN-63の実幅・可読性判断およびオーナー受入を残す。
- ChromiumのCSS viewport検証。Safari実機、iPhone/iPad実機、iOSタッチ・キーボード・ネイティブselectは未確認。
- スクリーンショットの濃い横帯は既存sticky版バッジ。全ページ／長い要素の撮影途中にも写る。今回は無変更。
- 全MHDBデータのlocalStorageへの再現時にQuotaExceededErrorを観測（compact DB約7.6MB）。メモリ再現に切替。これはテスト準備での観測であり、製品のキャッシュ保存成功を主張しない。実データキャッシュの永続化は別調査が必要。装備セットの小さい保存・再読込は上記の通り確認済み。
- 初回sandbox内のfetchはDNS制限、ChromiumはMachPort権限制限で失敗。require_escalatedの自動承認後は成功。未解消の操作拒否なし。
- npm ciはlockfile無変更。npmが既存依存にhigh vulnerability 1件を報告。依存更新は本UI作業で実施していない。
- PRはDraft維持。merge・承認・β公開は未実施。技術確認／オーナー受入完了とはしない。

## ローカル証拠

作業親ディレクトリ `/Users/scream/Documents/Codex/2026-11-04/task/`:

- `evidence/static-baseline/`: 基準HEADの5幅PNGとJSON。
- `evidence/loaded-*.png`, `armor-*.png`, `loaded-metrics.json`: 実MHDB取得直後。
- `evidence/before-*.png`, `before-metrics.json`: 同データ再現・変更前。
- `evidence/after-*.png`, `after-metrics.json`: 変更後。
- `evidence/operations.json`, `comparison.png`, `presentation-*.png`: 保存比較・表示4状態。
- `evidence/mhdb-loaded.json`: 今回取得した実データ（製品DBとして追加しない）。
- `probe.cjs`, `verify-layout.cjs`, `verify-operations.cjs`: 一時ローカル再現スクリプト。製品や旧CSSへ組込みなし。

## 第2回 UI点検（DB実装前の区切り）

KAN-63 #11096を直接再読し、一般画面から隠す明示指示と実画面を照合。
- P1修正: 比較専用の根性・不屈・龍肉質入力、ヘビィ／弓補助条件、⑦コンボ、実測JSON診断の非表示漏れ。値・DOM・ハンドラは保持。DPS比較行／参考DPS説明も非表示。通常／最大の実値と保留理由は表示維持。
- P2修正: 比較表がPCで472pxのまま右余白178pxを残す問題。利用可能幅650pxへ拡張。スマホは最小幅472pxを保ち表内スクロール、項目名を左に固定。390px横スクロール後の項目名x=-120→38px（表左端37px）。
- 比較ボタンの文書内位置: 1024px y1511→1020、375px y8011→7486。表示漏れの補助入力分を短縮。外側50:50と内側配置は変更なし。
- 28件の既存UI検証PASS。実データを再現した5幅で比較表全幅・項目固定・非表示対象・文書横はみ出しを修正前FAIL→修正後PASS。異装備A/B保存／取消／個別復元／再読込復元と4表示状態も再確認。隠したpowerGutsState=BEFORE、powerFortifyCount=2、comboMovePicker=gs_drawは前後一致。
- 残P1: iPhone内部6:4と実幅優先の受入、Safari/iPad/iPhone実機。残P2: アイコン図柄のオーナー受入、開閉した詳細診断内の旧DPS項目、長い装備編集画面のオーナー評価。容量問題は別課題。
- 証拠は親ディレクトリevidence/round2-before と round2-after。各5幅のlayout/comparison/scrolled PNG、operations.json。以前の証拠は上書きなし。UI区切りのHTML・patchはevidence/ui-checkpoint。
