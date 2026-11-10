# 既存テスト環境・入力契約の修復

基準は GitHub に反映済みの `8f6e759e0745618bb26b26c0962bc62735426616`。今回のテスト修復はローカル候補であり、まだ送信していません。製品・DB・仕様の内容は基準と同一です。既存の同じ開発履歴を使い、新しいブランチは作成しません。

## 全件再実行の結果

| suite | 基準 | 修復後 | 既存失敗から回復 | 以前の成功から失敗 |
|---|---|---|---|---|
| 公式 | 1161件:1038成功/123失敗 | 1224件:1192成功/32失敗 | 84 | 0 |
| DOM | 510件:322成功/188失敗 | 518件:356成功/162失敗 | 27 | 1 |
| browser | 88件:18成功/70失敗 | 90件:21成功/69失敗 | 1 | 0 |

全件skip/cancelled/todoは0。公式の15ファイルの起動失敗が解消され、以前は実行されなかった72検査が現れました（64成功/8失敗）。これとは別に公式6、DOM8、browser2の補助検査を追加しました。起動失敗コンテナの消失をテスト削除や同数の不具合解消とは数えません。

以前の対象未保存が最初の障害だった53検査は全てその障害を通過し、うち23件が最後まで成功、30件は後続の検査で失敗します。到達改善を全件成功とは数えません。

統合契約1500件、freshness94件、保存済み検証ソース47件は全成功。依存不要の統合契約は `NODE_PATH` を空にして実行しました。全旧suite成功、ゲーム内精度検証、Safari実機受入という意味ではありません。

## 修復した共通原因

- 切り出したVMに欠けていた実際のブラウザ依存を読み込みます。結合の強いbuild/保存比較試験は本物のローカルpageとscript順序で実行。数値計算の代用品は追加していません。隔離、offline、Appとの参照一致、終了時cleanupを直接検査します。
- NORMAL砲術の正の入力は既存の攻撃200/倍率1/加算0に対応するweaponBase200を明示。Artiaの正の入力は既存の採用表とMHDBに対応する200/180/190とGogma名を明示。旧数値期待値は変更していません。これは入力不変ではなく、出典を伴うfixture修復です。
- DOMの正の合成fixtureに、保存可能な実training-front対象、明示gameId、白ゲージ、必要なビン/弾/状態を指定。必要情報をhelperが勝手に補う設計ではありません。6スキルは保存済みMHDBの原レコードと一致。Lv0は正のfixtureでは付与なしとし、別の無効入力試験では拒否を維持します。
- training-frontは物理80/属性30です。旧monsterHZ45/20のstubが正式adapterの対象だとは扱いません。従来の数値矛盾はそのまま失敗として残します。合成ID987・白1区間などは明記した試験入力であり、実装備の事実ではありません。
- 竜撃弾22条件は、正式pipelineのnormal単一成分のdetailsと旧参照結果との対応を実コードで確認。元の22期待値と両Hitの識別・件数・順序・数値を維持し、欠落や不一致11種類で検査が失敗することを確認しました。値の推測、fallback、結果の合成はしません。
- browser fixtureが配信していなかったui/下の実scriptを読み込むよう修復。外部、未許可階層、非script、欠損moduleは遮断を維持。実際に公開されている弓設定のwrapperだけ参照を修正し、元assertionを保持しました。

## 新たに見えた失敗と残課題

以前成功していた竜撃弾の複合検査1件は、手動fire肉質を空にしたところで失敗します。旧fixtureは武器入力不正で先に停止していたため、目的のguardへ届かず成功していました。現在は選択した実対象からfire30を取得し187.29を返します。これを隠していません。対象優先規則と旧期待の照合が必要です。

GL旧砲撃名の現行技IDへの変換後の例外、旧Hit/result形式、保存比較の旧項目、近似100への厳密一致、採用範囲の古い期待なども残ります。これらを一括して製品不具合または古いテストと断定しません。DPSや開発用参考UIを復活させず、旧34見出し・12非表示操作の対応は [移行対応表](browser-ui-migration-map.md) に記録しました。

全失敗名・回復名・新規到達名は [failure-dispositions.json](failure-dispositions.json)、製品hash・file差分・ログhash・全件数は [verification.json](verification.json)。単に計算成功へassertionを置き換えたり、失敗をskip/deleteしたりしていません。

## 再現

Node24.22.1、package-lockのjsdom30.1.2/playwright1.62.1を使用。通常の依存installに加え、PlaywrightのChromiumを用意してください（`npx playwright install chromium`、または既存ブラウザを `CHROMIUM_EXECUTABLE` で指定）。必ず使い捨てコピーで実行してください。既存browser suiteは歴史evidenceを生成更新するため、元checkoutでは実行しません。

```sh
node --test --test-reporter=tap tests/*.test.cjs
node --test --test-reporter=tap tools/*dom.test.cjs
node --test --test-reporter=tap --test-concurrency=4 tools/*browser.test.cjs
NODE_PATH= node tools/integration-regression/run.cjs
NODE_PATH= node --test tools/cb-gl-scope-regression/freshness.test.cjs tools/sa-hh-scope-regression/freshness.test.cjs tools/gl-hh-scope-regression/freshness.test.cjs tools/input-guard-regression/freshness.test.cjs
npm test --prefix tools/commit-autotest
```

freshnessの正確な4パスは `tools/cb-gl-scope-regression/freshness.test.cjs`、`tools/sa-hh-scope-regression/freshness.test.cjs`、`tools/gl-hh-scope-regression/freshness.test.cjs`、`tools/input-guard-regression/freshness.test.cjs` です。実行ログは同じ統合保存場所の `evidence/legacy-harness-repair-20261110/` に保全します。原作業checkout・保存データは使用していません。
