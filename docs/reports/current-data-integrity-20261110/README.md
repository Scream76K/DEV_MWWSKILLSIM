# 保存入力・現行比較データの整合修正

基準: `02ced3f76cec94b37d86d37331324edc4e7dcfe5`（公開済みmainline）。この版はその後のローカル修正版で、GitHub未送信。正確な保存commitは `git rev-parse HEAD`、公開状況は反映時の別記録で確認します。

## 修正した実不具合

1. 名前のある保存済み護石スキルのLvがnull・空文字・欠落の場合、読み込み時に勝手にLv1へ置換していました。実MHDBの攻撃スキルでは攻撃90が93になっていました。元の不正値を保持して既存の入力検証へ渡し、架空の効果を加えません。無名編集欄の初期Lv、正常な旧形式、表示・保存は維持します。元の保存JSONを読み込みだけで書き換えません。
2. 画面は現在の選択技を計算しているのに、相談用データは旧STANDARD値を主値として渡していました。現在の結果はschema3に統一し、画面と同じ通常・最大・物理・属性・特殊の内訳・相対値・算出範囲・理由を使用します。A未算出でも有効なBの絶対値を保持します。旧診断は明示的な`legacyReference`へ隔離し、旧参照だけの呼出しはschema2互換を維持します。
3. 現在入力と最後の計算が異なる場合は`CURRENT_CALCULATION_STALE`を返します。相談データ準備で勝手に再計算・保存比較破棄はしません。独立レビューで見つかった異なる技の保存A読込時の誤判定も、実際に評価した技の記録へ修正し再検証しました。DPS中止と未反映スキルのチャンネル別注記を相談文にも反映します。

外部AIへの送信は行っていません。計算係数・技採用・DB・adapter・スキル継続2moduleは変更していません。

## 最終統合候補の検証

- 公式: 1230件1198成功/32失敗 → 1243件1212成功/31失敗。旧r206ソース文字列検査1件を実動作検査へ置換し、新13件を追加。名前単位では旧失敗1件の置換＋新14成功であり、同名検査の回復とは数えません。
- DOM: 518件357成功/161失敗 → 533件372成功/161失敗。新15件成功。
- Chromium: 90件21成功/69失敗 → 92件23成功/69失敗。新2件は390px/1440px。
- 従来成功→失敗0、新規失敗0、skip/cancelled/todo0。全suite成功ではありません。
- 依存不要の1506、freshness94、source-only47は成功。固定lockfileをローカルcacheから新規導入し、別CIと同じJSDOM39件は39成功。
- 実MHDBのGL315/319×通常砲撃・溜め砲撃・フルバースト、6装備12チャンネルと3組の保存A/BをJSDOM/Chromium双方で確認。旧診断だけでなく現行pipelineのID・値・チャンネル・保存復元も厳密比較。
- 独立レビューでは追加の不正入力20例、実MHDBの不正Aと有効B、異なる技の保存読込、48件のfocused unionと390px/1440pxを別実行。全suiteは統合担当の生ログを独立照合しました。

最終生ログとproducerのRED/GREENは統合保存先の `evidence/current-data-integrity-20261110/`。このcommit内の[検証JSON](verification.json)は入力hash・件数・残失敗名を収録します。旧02cedの全suiteログを基準として再利用し、修正の最小REDは別に再実行しています。

## 旧テストとの互換性

15件の既存unit/DOM/browser検査と2つのGL proofのみ、数値期待を変えず旧診断の明示領域へ移しました。[対象一覧](legacy-consumer-migrations.json)。厳密helperはschema・scope・存在・装備名不一致で必ず失敗し、現在値へfallbackしません。他の旧consumer全部を移行済みとはしません。

## 再現

Node24で `npm ci --ignore-scripts` 後、`npm test`、`npm run test:dom`、`npm run test:browser`。browserはPlaywright対応Chromiumが必要で、使い捨てstorageのみを使います。既存browser suiteが履歴測定JSONを書き換えるため、全suiteは必ず使い捨てのcopyで実行し、生成結果を保存したうえで元fixtureを復元してください。

焦点化CIの39件と1506/94は[runner説明](../../../tools/integration-regression/README.md)に記載。source47は `cd tools/commit-autotest && npm test`。実GL proofは既存固定fixture（raw-packとui-public-14-strict）を別途要求し、非同一DBで代用しません。

## 未完了

[残課題の分類](RESIDUAL_TRIAGE.md)。旧機能の照合、通常弾10射と未決の弾Lv/速射、全装備・全スキル組合せ、ゲーム実測、Safari/実機受入は未完了です。不正入力の一般的な全container/slot修復やArtia期待値移行も今回の対象外です。
