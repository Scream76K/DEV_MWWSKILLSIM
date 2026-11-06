# フランメ向け引継ぎ（2026-11-06）

ユーザーの明示指示により今回の成果をcommit/pushする。統合・公開・全経路受入は行わない。

## 対象
既存UI再開成果とHimmelの計算不具合是正を保持。標準条件の自動適用、状態異常・アーティア・武器固有成分の限定接続、通常/最大独立、保存比較、内部非丸めと表示1桁、護石入力検証、比較符号、武器アイコン配色/枠/改行を含む。キャッシュ製品モジュールと専用単体試験、ユーザー指定防具・護石6画像も必要資産として含む。各過去報告は当時の状態として保持し、本書が引継ぎ時の現況。

## 固定版と検証
index SHA256 `fe937b4fd453756ba0b7cc9bf2642651ee18d5b399f68283110f36e118062a54`（Git SHAとは別）。adapter `c5d9cbabb384bf0da083f8c1bfd2616f409cc1d66a80b24a6d841f4ffe2d6853`、bundle `207fbb7778b9ee37561baefd6795d2b7f8c1044b6774c95ec585e2f03f8a8325`。
- このindexの既存限定証拠を再利用：DOM16、符号25、14武器代表保存比較14件errors0、検証JSON7件。ローカル `/tmp/himmel-icon-palette-fix-20261106/`。この一時証拠はGitへ同梱しない。
- 引継ぎ直前 `node --test tools/combo-verification-dom.test.cjs tests/local-mhdb-cache.test.cjs` 14/14、失敗・skip0。`git diff --check`通過。
- 隔離Chromium390/768/1024/1440幅で14枠・DB前後・指定改行・実computed配色、14選択、実大剣レア1/3/5、画像失敗時名称を確認。Safariの最新配色再確認、iPhone/iPad実機、全装備全経路は未確認。

## 保持する境界・残件
容量未確定のHBGは容量非依存の限定経路と容量依存ガードを分離。未採用技・未知状態を成功扱いしない。暫定係数・成分契約を実機検証済みに昇格しない。標準比較と明示経路のスキル除外範囲を混同しない。旧検証JSONの一部CB経路は未接続で全体値nullを保持し、現在のR/H通常最大比較と区別する。全件監査・新テスト基盤の完成は本引継ぎの主張に含めない。

## コミット外に保護
以下の未追跡補助スクリプトは、今回引継ぎで個別の由来・現行契約・外部出力先まで受入確認していないため保守的に除外。削除せず同じ作業ツリーへ残す。製品の依存ファイルではない。過去の試験や調査に利用されたものも含むため、未使用・無価値という判断ではない。

- `tools/audit-skill-catalog.cjs`
- `tools/audit-weapon-catalog.cjs`
- `tools/cache-review-regression.cjs`
- `tools/capture-mhdb-test-data.cjs`
- `tools/details-toggle-regression.cjs`
- `tools/local-mhdb-cache-browser.cjs`
- `tools/owner-ui-regression.cjs`
- `tools/run-public-comparison-suite.cjs`
- `tools/standard-comparison-browser.cjs`
- `tools/standard-no-input-audit.cjs`
- `tools/standard-route-regression.cjs`

実保存・DBキャッシュ・認証情報・ローカルログ・画面画像は追加しない。ユーザーのタブや共有条件を変更しない。既存worktreeを保持。
