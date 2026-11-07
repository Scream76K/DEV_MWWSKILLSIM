# Git commit テストツールのソース候補

**状態: SOURCE_ONLY。製品検査を実行できる配布物ではありません。**

v12.1のランナーとハーネスをGitHub管理へ移すための最小候補です。ランタイムの既存コードは変更していません。製品コードのコピー、node_modules、外部DB・分類データ、過去の結果・生成物は含めていません。欠落データを現在結果や合成fixtureで代用しません。

## 今ここで確認できること

Linux、Git、Node 24.15以降の24系で、このディレクトリから実行します。npm installは不要です。

```sh
npm test
```

同梱の6テストファイルから19テストを実行します。Git objectからの取得、未保存変更の非干渉、改ざん拒否、依存契約、script表記、集計・比較の負例を確認します。一時Git repositoryには小さな合成データだけを使い、終了時に削除します。製品コード・MHDB・ネットワークは使いません。これらの成功は、実GitHub commitの製品E2E成功ではありません。

v12.1との違いはテスト入力の合成化のみです。commit-snapshot.test.cjsとgs250-oracle.test.cjsを調整し、test-support/synthetic-tool.cjsを追加しました。実DBに依存する7テストファイルは今回の最小候補から除外しています。除外名と原版hashはsource-manifest.jsonに記録しています。

## 製品実行を止めている不足物

source-manifest.jsonに必要ファイルのbytes、SHA256、用途、復元条件を記録しています。

- 製品44ファイルはコピーせず、指定した完全SHAのGit objectを既存ランナーが読みます。基準は5f1f733fc00c770073704c699ea7c2641a8bc9fbです。変更した製品bytesには別途レビュー済み依存契約が必要です。
- normalized-data.json、raw-skills.json、classification.candidate.jsonは欠落しています。現在のAPIを再取得しても同じbytesになる保証はありません。固定captureの保管先・利用条件・対象ゲーム版を確認し、hash一致する入力を用意する必要があります。分類を自動承認しません。
- extracted-converter.jsは製品からの重複コピーなので除外しています。converter-provenance.jsonの完全commit・行範囲を改行を保って連結し、最終SHA256一致を確認して復元します。固定ローカル基準bytesからの12範囲・最終hash再現は確認済みですが、GitHubからの独立取得を通した再生成は未実施です。
- 過去診断データと固定oracle生成物も除外しています。現ランナーはこれらを要求します。derive_expected.pyはGS250の算術用の中間出力だけを作り、既存expected-values.jsonのラッパー・全oracle・過去診断を再現する完全buildではありません。全不足物の復元または別途レビューした除去・再生成手順が必要です。
- 依存パッケージは固定package-lock.jsonから、Linux上で下記のように取得する設計です。今回はレジストリからの再取得を実施していません。依存の一部がNode 24.15以上を要求するため、元ランナーの24.13下限だけを頼りにしないでください。devDependencyのPlaywrightはこのハーネスでは使用しません。

```sh
npm --prefix dependencies ci --omit=dev --ignore-scripts --no-audit --no-fund
```

DB等の利用・再配布条件は未確認です。GitHubへの同梱や新しいライセンス付与はしていません。source-manifest.jsonのhashは内容識別であり、ライセンス・ゲーム版・数値正当性の証明ではありません。

## 不足物を確認した後の入口

Linuxのuser/mount/net/PID namespace、bash、unshare、mount、chroot、setpriv、realpath、tee、mktempが必要です。隔離失敗時の解除fallbackはありません。

```sh
bash run-commit.sh --repo /path/to/repository --commit FULL_40_CHARACTER_SHA --output /path/outside/repository/new-run
```

現状のソース候補だけでは準備時に不足物で停止します。--prepare-onlyの終了0は製品実行成功ではありません。run-all.shは旧固定入力用としてソースだけ保存し、製品コピーを再導入する運用は推奨しません。

終了0は指定工程内で検出事項なし、2は完走したが既知失敗・未算出・要確認あり、3は準備・隔離・版不適合などで未完了です。130未算出と既知GS4失敗、丸め・実HP・ゲーム版・全組合せの未検証は解消していません。

## 統合案

対象はScream76K/DEV_MWWSKILLSIMのtools/commit-autotestです。確認時のmainlineは6c3185201139ed7ec2251373a364c5cf966b4390で、このパスに同名の既存ファイルはありませんでした。反映前にHEADと衝突を再確認してください。

mainlineは製品基準のまま保ち、最新の正本を基点に専用作業ブランチ（例: work/commit-autotest-v12-1）でこのパスだけを追加します。既存checkoutが汚れている場合は触りません。今回、ブランチ作成・commit・push・PR・mergeは実施していません。

レビューでは追加対象がこのディレクトリだけであること、秘密情報・個人情報・欠落データが紛れていないこと、npm testが通ることを確認します。完全なGitHub E2Eとデータ復元・利用条件の確認後に製品検査用として採用を判断します。ZIPや旧ローカル成果物を別の開発正本にしません。
