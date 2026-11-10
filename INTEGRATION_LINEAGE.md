# 復元修正のローカル追補（基準6df2116a）

今回の同一履歴上の修正は、旧比較sessionの入力自動保存・再読込を現行計算APIへ移植し、既知の旧キャッシュを検証付きで読むものです。旧kan108を一括mergeしていません。下記公開6dfチェックポイントの「session照合中」はこの修正前の状態です。

全14武器の入力復元・旧形式・破損時保全を限定検証しましたが、旧Rathian数値・旧API全経路・172波/本体仕様・龍肉質自動引継ぎは完成扱いにしません。新規branch・GitHub送信なし。[今回の検証](docs/reports/reload-input-integrity-20261110/README.md)。

## 以下は今回追補前の記録（原文保持）

# 統合系譜と仕様の確認範囲（2026-11-10）

## 現在の公開チェックポイント（2026-11-10）

正本は GitHub `Scream76K/DEV_MWWSKILLSIM` の公開済み mainline [`6df2116a0cec4cf22ea42592f8d3de6d036d523c`](https://github.com/Scream76K/DEV_MWWSKILLSIM/commit/6df2116a0cec4cf22ea42592f8d3de6d036d523c) です。この固定commitの公開確認を、β公開・実機受入・全仕様完成とは扱いません。

- C04/C05のスキル除外・未対応効果を明示した計算継続は [`8f6e759e0745618bb26b26c0962bc62735426616`](https://github.com/Scream76K/DEV_MWWSKILLSIM/commit/8f6e759e0745618bb26b26c0962bc62735426616) で統合され、上記mainlineに含まれます。その後の `966ab612` の旧テスト環境修復、`02ced3f7` のGL実行ID維持、`6df2116a` の保存入力・現行比較データ整合修正も同じ履歴に含まれます。スキル継続を「共有基盤へ未適用」とする下記の記述は統合前の履歴です。
- 同固定版の全件検証は公式1243件（1212成功/31失敗）、DOM533件（372成功/161失敗）、browser92件（23成功/69失敗）。[検証JSON](docs/reports/current-data-integrity-20261110/verification.json)に範囲と残失敗を保持しています。全suite成功ではありません。
- 同commitのGitHub CIは [統合・入力検証](https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/42852965767) の1506件・freshness94件・現行データ39件が成功し、[非CB13武器smoke](https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/42852965731) は13武器26チャンネル・error0です。source-only47件は同commitのローカル再実行で47成功。このpushではそのCIは起動しておらず、GitHubで再実行済みとはしません。
- C03の通常弾10射基準は未反映、弾Lvとライト速射は未決定です。旧kan108の比較session自動保存・offline reload、龍肉質の空欄時自動引継ぎ、DarkArts固定龍波/Burst経路の同等性は引き続き照合中です。履歴統合やCI成功をこれらの復旧完了へ読み替えません。全装備・全条件・実ゲーム数値精度・Safari/iPhone/iPad実機受入も未完了です。

現在の採用仕様とC04/C05の実装状態は [spec/CURRENT_CONTRACTS.md](spec/CURRENT_CONTRACTS.md) を参照してください。[INTEGRATION.md](INTEGRATION.md) と [INTEGRATION_VERSION.json](INTEGRATION_VERSION.json) の未公開表示は作成時点の履歴（`SNAPSHOT_AT_BUILD`）であり、この公開確認で過去本文やhashを書き換えません。本追補は文書の状態整理だけで、計算・DB・テスト・採用仕様を変更しません。

## 以下は初回統合・仕様確認時点の履歴（原文保持）

以下の「正本」「現行」「今回」「未送信」、枝数・包含件数・失敗件数は各記録当時の状態です。現在の公開・実装・検証状態には上記チェックポイントを使用し、旧kan108等の未解決事項を完了扱いにしません。

## 正本と保護

正本は GitHub `Scream76K/DEV_MWWSKILLSIM` の mainline `6c3185201139ed7ec2251373a364c5cf966b4390`。ローカル配信元 `5f1f733` と製品内容は一致し、差はAGENTS.mdだけです。この統合作業は別コピーで行い、配信元・ユーザーのブラウザ保存領域・旧未コミット作業を変更していません。

remote 59枝を全件棚卸しし、26枝のHEADはこの統合履歴の祖先、33枝は非祖先です。非祖先は機能欠損と同義ではありません。全HEADと各包含判定は成果物の `evidence/branch-inventory.json`、全Git履歴は `integration-preservation.bundle` で保全します。元の未追跡検証11ツールも元ファイルを変更せず成果物内へ複製しています。

## 今回履歴へ統合した先端

| 系統 | 先端 | 取込範囲 |
| --- | --- | --- |
| GL/HH範囲回帰 | deb9cdbdb5cc7d75a374bac928a8f410fc5d44d4 | 共通9コミットとGL/HHの固有修正・検証 |
| 入力ガード | 33e7156bf6dd7c0971b4b18e16363e3e7ef88188 | 入力ガードの固有修正・検証。CI競合だけ解消 |
| commit-autotest | 8c2d4c3b2756f9ded881b957c1fb8282b24ca933 | source-only 62追加ファイル。私有入力等不足は維持・明示 |
| 非CB13武器smoke | 5acc602cec0abd22e154b88e6079513494ce8d61 | 元script保持、CIのmainline push/PR対象追加 |

これにオーナー指定の破壊王除外と、CB R/H合算時の除外注記伝達だけを追加しました。新しい全スキル継続計算機構は別コピーで保留し、この版には混入していません。

## 旧UI系統

旧 `5845655` の821px境界・1.65:1比率・武器選択移動を一括で戻しません。mainlineの `12533fc` が最新計算基盤へUIを選択移植し、`24033ba` がオーナーの50:50画面指示を反映。その後 `045e58f` の981px境界、`7761485` の通常/最大独立表示、`5f1f733` の実計算・比較・指定画像修復が現行へ入っています。

現行のUI/保存/通常最大独立契約42件は成功。Chromium375/390/768/1024/1440pxで配置・50:50・文書横はみ出し・診断パネル非表示を確認しました。旧 `5845655` の比較test4件は古いVM fixtureに新しい依存関数がなく実行失敗し、そのまま現仕様の回帰ゲートとして採用していません。失敗記録を保持しています。Safari/iPhone/iPad実機は未検証です。

`Scream76K-upload-1` の装飾品変更をBuild Stateへ先に書き込み二重changeを避ける修正とcompact CSSは、現行の対応箇所に存在します。`codex/kan30-safari-preview` は旧previewサブディレクトリの系統として保持し、現行rootを古いpreviewで置換しません。

## 旧kan108系統の未解決

旧 `f1c063140843a9a2ea670c1053f9ed453a9b23de` の7コミットは履歴未包含です。共通祖先は `8ba21ea`。次を区別します。

- 共通normal/maximum計算・効果分離・同session保存比較は現行のHimmel pipeline、immutable provider、evaluateConsumerCombatで代替されています。旧API/traceと数値の全経路同等性は未実証です。
- DBキャッシュは現行 `ui/local-mhdb-cache.js` で代替され、検証・hash・世代救済・rollbackが存在します。
- 比較sessionのcurrent build/条件/選択名/baselineを自動保存しoffline reloadで復元する旧 `comparison-session.js` 相当は、現行で未包含です。通常の手動保存・読込・比較はあります。
- 龍肉質空欄時に選択対象部位の値を自動引継ぎする処理は未包含です。現行は明示取得ボタン方式です。
- DarkArts固定龍波のnormal/maximum保存combo接続とBurst武器属性限定receiptの旧機能は、現行での包含を確認できません。同じ参考式ファイルの保持だけでは経路の保持を証明できません。現行には別の172本体赤ゲージ契約があります。
- 旧Rathian 13/2700の実装備試験は現行adapterのtraining-room/front範囲と異なり、そのまま通せません。旧production HTTP loader・実装備A/B・独立算術・offline reload検証群も未移植です。今回の13武器smokeはこれらの代替ではありません。

これらが意図して撤回された仕様か、移植漏れかの根拠は未確定です。旧bonus whitelistのまま戻すと新採用を失い、旧Critical Drawの共通affinity適用は現在のオーナー除外と衝突します。従って一括mergeや旧期待値への変更は行わず、現採用仕様と照合した移植・回帰が必要です。

根拠: 旧 `comparison-session.js`、`tools/kan47-real-equipment-browser.test.cjs`、`docs/reports/kan47-repair-checkpoint/RESULT.md` 290–350行、`CHECKPOINT.md`。旧checkpointもfresh全suite再実行を主張していません。

## 保留している主張

全スキルで停止しないこと、全過去機能の同等性、すべての武器状態・対象・技・装備組合せ、実ゲーム数値精度、旧CB独立系統全件の受入は完了していません。公式123、DOM188、旧browser70の既存失敗は前後同名で残っています。新規失敗がないことと既存不具合がないことは別です。

この版は「現行を巻き戻さず確認済み修正を統合した基盤」であり、「過去すべての機能を復元した完成版」ではありません。未確認の系統は元HEADと証拠を保全し、根拠を確認してから同じ統合履歴へ反映します。

## 一本化と整理の順序

1. 正本は既存mainlineのまま。今回の隔離統合は同じ既存作業枝のcommitで固定し、追加branchは作りません。
2. 採用済み仕様の未包含・衝突を照合し、必要な移植を同じ履歴で検証します。先に古い枝をまとめてmergeしてから辻褄を合わせる方式は採りません。
3. 正本へ反映する操作は、対象SHA・差分・残失敗を示して承認を得た後に行います。GitHubへは未送信です。
4. 不要枝の削除は別途承認後。26祖先HEADであってもmainline・旧比較用develop等を一括削除しません。非祖先33枝は内容の保全/包含/意図した不採用が確定するまで削除しません。
5. 以後の修正履歴はcommitで管理し、branchをリビジョン保存の代わりに増やしません。

最新の確定決定と上書き履歴の入口は [spec/CURRENT_CONTRACTS.md](spec/CURRENT_CONTRACTS.md) です。旧DPS関連機能の不在を無条件に復旧対象へ数えず、11/3中止と後続指示に照らします。通常弾10射等の後続決定もこの台帳で既存実装との差を管理します。
