# r250 第2段階 実施報告

13件の旧失敗は根拠付き整合により解消。製品はOCR最小2修正とSALADA注記訂正。実画像の自動認識精度には残課題があり、OCR全面完成・公開可とは判断しない。

## 安全確認

作業は `/Users/scream/Projects/DEV_MWWSKILLSIM-r250`、`codex/integrate-r249`。ベースHEAD `fb6d82cd525da9273af10ac6b719f330208608c5`。原本リポジトリはdevelop/clean。main/develop/origin/main同ベース、origin/develop `08872bb756f6fd07d0b8626ad2ec472df8141bae`は3先行。今回fetch・履歴操作・commit/push/PR/公開なし。PROJECT GUILD 3Dアクセス・変更なし。

第1段階未コミット状態はbefore-manifestとbefore-worktree.tar.gzへ保護。共有Git管理情報の保護は既存r250-migration-backup-20261010を維持。既存754ファイル欠落0。Git専用143ファイル全て存在、132内容一致。11旧OCRテストは今回の明示依頼に基づき更新、旧版全内容をarchiveへ保持。143全ハッシュ一致とは報告しない。原本・r249候補への書込なし。

## 修正と根拠

- index埋込`v400RegionsFromGrid`：表示grid.ocrを1行コピー。再計算で表示315→実入力297になる不一致を解消。新規赤/緑とrefined優先検査。
- index埋込`reflectAnalysisToBuild`：candidate_pendingが存在する間は反映前に中止。自動確定、候補選択済み、手動確定は維持。実画像で誤候補が入った再現と副作用回帰。
- SALADA_BOW_05：既存装飾品値はR10と一致。notesの旧「脚なし」1文を過去ユーザー確認に基づく腰体術/脚挑戦・重撃へ訂正。元動画の時刻/元画像未特定、今回映像再検証なし。
- step11ファイル、tools/legacy-ocr-source.cjs：埋込をJSON復号し必要関数を抽出。旧scalar/タイトル/ROI期待は既存後続契約に整合。削除/skipなし。
- tools/r249-template-gates.test.cjs：R9達芸珠、R10腰脚所有権と注記を検査。REGRESSION_GATES原本は保全し後続記録で上書き解釈。装備/装飾品/スキル数値、計算ロジック、Technique DB変更なし。

[13件詳細](CAUSES.md)、[独立レビュー](REVIEW.md)。

## 最終テスト

Node24.19.0、jsdom30.1.2、Playwright1.62.1、Chromiumで実施。package.jsonのtest/test:dom/test:browserと同じ対象を絶対Nodeで起動。browser最終は直列（--test-concurrency=1）。

| 対象 | 前回/修正前 | 最終成功 | 失敗 | skip |
|---|---|---:|---:|---:|
| Node tests/*.test.cjs | 731/0 | 735 | 0 | 0 |
| DOM tools/*dom.test.cjs | 302/0 | 302 | 0 | 0 |
| browser tools/*browser.test.cjs | 46/0 | 46 | 0 | 0 |
| 保存比較・14武器追加smoke | 16/0 | 16 | 0 | 0 |
| 旧OCR step*.test.js | 0/11 | 11 | 0 | 0 |
| template gates | 4/2 | 6 | 0 | 0 |

Nodeの追加4件はgrid引継ぎ/refined優先、pending副作用禁止/明示確定許可。旧OCRはファイル単位、smoke16は親を含む。重複を合計し品質点数にしない。ブラウザ並列初回は61成功/1失敗（幅0vs112/120/120）、単独1成功、直列62成功。期待値変更なし。並列の原因は未確定、安定性課題を残す。

## 実画像OCR・実装備反映

実MHDBへ直接接続、実Tesseract5.1.1 worker、日本語学習データを使用。認識結果・DBをmockしない。API版timestampは2026-04-15T01:28:18+00:00、ゲーム対象版との対応は未確認。取得件数weapon1160/armor714/charm64/deco361/skills179/sets194。最初のfixture配信はページングを誤りデータ重複したため無効とし、実API接続でやり直した。

| 画像 | 認識実行 | 自動確定 | 未確認反映 | 手動確定後 |
|---|---|---|---|---|
| sample_game.png | 7部位・実Tesseract | 0/7 | 拒否、ビルド不変 | 正解名の独立証跡不足のため強制選択しない |
| examples/equipment_example.jpg | 7部位・実Tesseract | 0/7 | 拒否、ビルド不変 | 画像で確認できる5防具を実MHDBから手動確定しID/name/slots一致 |

5防具：クイーンピアスα700[3,1,1]、シュバルカメイルγ706[3,2]、護火竜アームβ68[2,1,1]、ダハディラコイルγ685[1]、ゴググリーヴβ679[3,2,1]。武器同名3レコードとランダム護石は写真から一意に確定できず明示保留。手動確定の成功を自動認識成功に含めない。保存比較不変条件と同じcomparable snapshotを使用（タイムスタンプは比較対象外）。装飾品の実画像E2Eは今回未実施。

再実行用tools/r250-real-image-ocr.cjsはネットワークを使う任意QAハーネス。結果は一時フォルダへ保存し製品ファイルを書かない。外部資産/ネットワーク依存なので通常のオフライン単体対象に含めない。

## 未解決と次工程

1. P1：実画像のROI/認識精度。公開解析導線はcalculateEquipmentROIsRefined→中央16:9の固定比率基準を使い、縦写真でgameAreaが実装備列と一致しない。写真は負例として扱い、16:9実機原画像・枠撮影・黒帯の正解viewport/9行/cropを先に固定し、topdown仕様との経路差を検証。推測の座標補正は実施しない。
2. P1：SALADA_BOW_05腕はMHDB護火竜アームβ[2,1,1]に対しテンプレート珠[3,2,1]。出典所有権・限界突破・API対象版を照合して解決。勝手に他部位へ移動しない。今回の腰脚2件解消を全体適合と取り違えない。
3. P1：SALADA元映像の確認時刻/画像と、装飾品実画像→反映の検証。過去ユーザー確認をverifiedへ昇格しない。
4. P2：確認済み行のUI表示、pendingメッセージの内部キー、ブラウザ並列安定性。
5. P2：実MHDB14武器正式DPSと保存比較。smoke成功は保留状態も含み、全武器正式DPS完成ではない。

今回の最小修正は独立レビューで統合可。ただしコミット/公開操作は未実施。残るP1を解消する次工程を推奨。

## 開発組織

himmelが編集、sein/fernが読取調査、eisenが独立レビュー。組織6担当の起動・委任・回収は実確認済み。設定自動読込は未確認として[稼働報告](../../agents/RUN_REPORT.md)と[機能確認](../../agents/CAPABILITIES.md)に記録。

証拠：evidence/各最終ログ、赤ログ、実画像JSON、MHDB応答根拠、Git安全JSON、before archive。MHDBのAPI利用契約は[公式ドキュメント](https://docs.wilds.mhdb.io/)参照。元[さらだ動画](https://youtu.be/E5vkLlVN7gI)は今回取得/映像確認できていない。
