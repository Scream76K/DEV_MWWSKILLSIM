# GL修正とテスト修復版の統合確認

実際の統合基準は `966ab612ebdf44af3596391a9be14952e743f6e1`。8f基準で作られた承認済み13ファイルの差分だけを適用し、966のテスト・補助33ファイルと検証報告4ファイルはbyte一致で保持しました。版説明2ファイルは今回の状態へ更新し、旧INTEGRATION本文を保持しています。GitHubへの送信はまだ行っていません。

## 今回の修正

GL通常砲撃・溜め砲撃・フルバーストの実行IDを補助計算でも保持し、保存比較のstageにも記録します。共通係数レコードのIDで実行actionを上書きしていたため発生したfilter例外を解消します。index.htmlの2箇所だけの製品変更で、adapter、式、係数、状態guard、スキル継続計算、保存schemaは変更しません。欠けた配列を空配列で補って結果を作る修正ではありません。

## 修復済みsuiteとの相互作用

- 公式:1224件1192成功/32失敗 → 1230件1198成功/32失敗。新6検査が成功、以前の失敗名は不変。
- DOM:518件356成功/162失敗 → 518件357成功/161失敗。`same-route relative damage changes are separate from STANDARD metrics` が追加で回復。
- browser:90件21成功/69失敗 → 90件21成功/69失敗。
- 今回の基準から以前の成功→失敗、削除、skip、cancelled、todoは0。966で露出した竜撃弾の手動肉質と選択対象の矛盾は未解消のままです。
- 統合1506件（79固定入力）、freshness94件、source-only47件は全成功。旧1500検査を維持して6件追加し、古い各枝の契約は変更していません。

実MHDBのGL315/319×3action、6ビルドの公開計算と保存比較をJSDOMと使い捨てChromiumで再実行。主計算と補助計算の値、保存・再読込・JSON、対応済sequence、弾不足/未対応混在の理由を確認しました。全14武器×4スキル56ケース/112channelも966基準と今回候補で再実行し、記録された数値・省略効果・理由が厳密一致しました。完全pipeline JSON一致やゲーム実測精度の認定ではありません。

旧作者報告のbase8fは元候補の検証基準です。今回の実統合基準966、製品hash、各suiteの残失敗名とログhashは [integration-after-966ab.json](integration-after-966ab.json) を優先してください。作者の報告・凍結patchは変更せず保全しています。

## 再現と残課題

Node24、package-lockのjsdom/Playwright、Playwright Chromiumが必要です。browser全suiteは歴史evidenceを生成するため使い捨てコピーで実行してください。既存MHDBテストfixtureは統合保存先のfixtures/です。実行方法は [元の修正報告](README.md) と [テスト環境修復報告](../legacy-test-harness-20261110/README.md) にあります。全件実行は `node --test --test-reporter=tap tests/*.test.cjs`、`node --test --test-reporter=tap tools/*dom.test.cjs`、`node --test --test-reporter=tap --test-concurrency=4 tools/*browser.test.cjs`。

通常弾10射、旧機能の全包含、他の残失敗、全装備/全発動条件、ゲーム内精度、Safari実機受入は未完了です。全suite成功とはしません。新branch・force push・既存branch削除は行いません。
