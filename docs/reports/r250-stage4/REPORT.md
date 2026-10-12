# r250 第4段階：未検証DPS表示の仕様整合

2026-10-10開始、2026-10-11再開・最終確認。既存ACCEPTED仕様に基づく最小修正を実施。未検証DPSを数値として表示・比較・JSON/AI出力する不一致を解消した。正式DPSの成立、14武器の実機検証完了、リリース可能を意味しない。

## 1. 作業場所と保全

- worktree：`/Users/scream/Projects/DEV_MWWSKILLSIM-r250`
- branch：`codex/integrate-r249`
- HEAD：`fb6d82cd525da9273af10ac6b719f330208608c5`
- main/develop/origin/mainは同HEAD、origin/developは`08872bb756f6fd07d0b8626ad2ec472df8141bae`、3コミット先行。全参照不変。fetch・履歴操作なし。
- 開始時818ファイルをevidence/before-manifest.jsonとbefore-worktree.tar.gzへ保護、欠落0。既存追跡327ファイルの欠落0、index.html以外326ファイルは開始時ハッシュ一致。前段階で確認済みのGit専用143ファイルも保持。第3段階報告・証跡の変更0。
- Technique DB・計算エンジン区間、埋込OCR、テンプレート区間を開始時indexと照合し完全一致。MV/Hit/属性/ビン回数/時間の数値変更0、VERIFIED昇格0。
- 原本リポジトリでコマンド実行・ファイル操作なし。worktree一覧の参照は指定開発worktreeから実施。PROJECT GUILD 3Dへのアクセスなし。commit/push/PR/merge/rebase/reset/公開なし。

詳細：[保全確認](evidence/git-safety.json)。ステージ開始時の未コミット成果との比較を使用し、HEADとの差分と混同しない。

## 2. 根拠と判断

原本仕様：[COMBAT_METRICS_DISPLAY](../../../spec/COMBAT_METRICS_DISPLAY.md)、Status ACCEPTED/2026-10-08。第3項と受け入れ条件は「時間や技データが未検証ならDPSは未算出と理由」「未検証なら数値を表示しない」。[04_COMBO_AND_DPS](../../../spec/04_COMBO_AND_DPS.md)も照合。既存テストの参考DPS数値期待と相違する場合は確定仕様を優先し、時間・ダメージ・Hit・保存復元の検査を維持した。

現行evaluateComboRouteはREFERENCE_ONLYを生成する参考経路。既存時間もユーザー登録時間も正式に検証されたルートの証拠ではなく、正式VERIFIED producerは確認できない。今回は新設せず、時間は参考値として保持し、theoreticalDps/practicalDps/oneMinuteをnullとする。未確認時間と成分阻害はTIMING_PENDING/BLOCKEDで区別する。

## 3. 修正内容と製品不具合

| 製品不具合 | 原因 | 最小修正 |
|---|---|---|
| 単独表示の参考時間から正式DPSに見える数値を表示 | REFERENCE_ONLYでもdamage/timeを数値化 | 評価層でDPS三値null、状態・理由を追加。総ダメージ・参考時間を保持し「DPS未算出」と表示 |
| 保存比較が検証状態を捨て数値・指数を生成 | dpsForStats/compareSnapshotの数値のみ受け渡し | 状態・理由を伝播、明示VERIFIEDかつ有限非負のみを通す共通ゲート |
| 旧比較キャッシュが数値だけでも表示・輸出 | UI/JSON/coverageがfiniteだけで判定 | 状態なし数値を拒否、JSONのDPS/指数/変化率もnull。入力キャッシュは改変しない |
| 検証レポート・AIへ未検証数値が伝播 | summary/comboEvaluationに検証状態なし | dpsStatus/dpsReasonを付加、同じnull方針を保持 |
| 比較準備欄の旧数値に未検証理由なし | row.dps==nullだけ判定 | 共通ゲートを使用し旧キャッシュにも理由表示 |
| 装備提案の旧数値が表示・差分・順位に使われる | 候補・基準がfinite判定のみ | 候補/基準の状態を伝播し、表示・DPSランキングを共通ゲートへ統一 |

製品変更はindex.htmlのみ。比較の非正規化火力/ダメージ/基準100補助指数の既存契約は変更しない。未検証DPS由来の値だけを保留する。保存データの装備・護石・スロット・装飾品・コンボの仕様変更なし。

[変更ファイル一覧](CHANGED_FILES.md)、[本段階index差分](evidence/index-stage4.diff)。既存21ファイル更新（製品1、テスト20）、新規回帰3ファイル、報告・保全証跡追加。削除0。

## 4. 回帰テストと期待値変更の根拠

新規：Node6、DOM2、Browser1。

- Node：参考時間のダメージ/時間保持・DPSnull、旧比較キャッシュ拒否、JSON状態/理由・非破壊、保存比較の伝播、準備欄理由、提案の表示/順位ゲート。
- DOM：旧時間・ユーザー登録時間の2経路を単独UI→保存比較→検証/比較JSON→AIまで検証。
- Browser：390pxのユーザー参考時間登録→保存比較→実JSONダウンロード→AI、ページエラー/横幅も検査。

修正前赤→修正後緑を保存。新Node最初4件は0/4→4/4、レビュー追加2件は2失敗→2成功、DOM0/2→2/2、Browser0/1→1/1。追加2件のログは既存新4件も含むため4/6→6/6。独立実行の同一テストを件数へ加算しない。

既存20テストファイルの更新は[期待値変更理由](EXPECTATION_CHANGES.md)参照。合成VERIFIED fixtureは表示・比率・差分・ゼロ/負値ガードの算術検査を保持する契約データであり、実技・実時間の検証済み昇格ではない。null同士だけの一致で数値DPS同値性を証明したと扱わず、時間/総ダメージ/検証状態/理由の検査も保持・強化した。削除・skip・onlyの追加なし。

途中実行の失敗も保存：最小修正直後Node744成功/6失敗（共通ヘルパーのVM抽出不足、分類C）、DOM287/15（旧参考数値・状態なしfixture、分類B）、Browser+smoke59/6（同B）。整合後750/302/65成功。レビュー追加後のDOMは302/2で、装備提案の旧ダッシュ期待と状態なし算術fixtureが原因B。未算出理由・明示合成状態へ整合して最終304/0。新Browser検査では保存によるUI無効化後に文字列を読むharness不備を修正し、計算直後のUIと保存後のレポートを別に取得した。

## 5. 最終テスト結果

Node24.19.0、jsdom30.1.2、Playwright1.62.1/Chromium。package.json対象を指定worktreeで実行。ChromiumはmacOS sandbox制約に必要な承認済み拡張実行。公開環境へのアクセスなし。

| 対象 | 第3段階成功 | 最終成功 | 失敗 | skip | 終了コード |
|---|---:|---:|---:|---:|---:|
| Node tests/*.test.cjs | 746 | 752 | 0 | 0 | 0 |
| DOM tools/*dom.test.cjs | 302 | 304 | 0 | 0 | 0 |
| Browser tools/*browser.test.cjs | 49 | 50 | 0 | 0 | 0 |
| 保存比較・14武器・旧護石smoke | 16 | 16 | 0 | 0 | 0 |

Browser+smoke合計66。smoke16は14武器+旧護石15子ケースと親1を含む。正式DPSの実機検証件数ではない。旧OCR11・Template Gates6の個別再実行は今回対象外（第3段階成功を保全、関連製品区間不変）。

証跡：evidence/mhwilds-stage4-node-final.log、dom-final2.log、browser-final.log、smoke-final.log。新規赤緑・途中失敗ログも同フォルダに保存。

## 6. QA・独立レビュー

[レビュー記録](REVIEW.md)。fernとeisenを実際に委任し、各8件（Node6/DOM2）独立成功、阻害指摘なし。両者とも製品/テスト編集0・再委任0。eisenのP2指摘（準備欄・提案キャッシュ）を実コードで確認し再現/最小修正後に再レビュー、解消確認。独立Browserはsandbox起動拒否のため製品検証に到達せず、成功として数えない。メインの承認済み実行50件成功とは区別する。

今回の仕様整合はレビュー上統合可能。commit・リリースの許可/実施ではない。

## 7. 未解決事項・次工程

1. P1：正式DPSのproducerと証拠要件。対象版、条件、技/特殊成分、実測時間、計算照合を揃える必要がある。VERIFIED文字列ゲートだけでは根拠検証にならない。全14武器の正式DPS成立確認0/14という第3段階監査を更新する証拠は今回取得していない。
2. P1：OCR実画像3系統のviewport/9行/name crop golden確定、装飾品までの実画像反映E2E。今回OCRは変更しない。
3. P1：SALADA元映像の装備/珠所有部位・対象版再照合。過去ユーザー確認を映像verifiedと扱わない。テンプレ数値/配置は変更しない。
4. P2：将来正式DPSを導入する際の同等条件・異武器種比較承認と検証契約。合成fixture成功を成立根拠にしない。ブラウザ過去並列幅0の根本原因は今回解消断定しない。

新たな仕様判断を推測で実装せず、正式DPS成立条件の具体化はゼーリエとユーザーへ提示する。
