# 端末内MHDBキャッシュ実装（未公開）

対象: `a0b60f39fa5798a371ad0dad56f5f3e9e2c253ab` 上のローカルUI差分を保持。ブランチ `zeerie/ui-resume-20261104`。commit / push / merge / β公開なし。

## 実装

- 各利用者が既存MHDB API取得経路で取得したAPI形状を維持し、IndexedDB `mhwilds-api-cache-v1` に active / previous を1トランザクションで保存。製品へのAPI応答同梱なし。初回はオンライン取得が必要。
- 起動時にschema、locale、adapter、件数、SHA-256、ID、装備スキル参照を検証して復元。API `/version` は取込日時として表示し、ゲーム版とは表示しない。
- 更新前後のAPI version一致、14武器種、必須配列、既存IDと名前等の同一性を確認。候補は永続化成功まで現行DBへ反映しない。
- 更新失敗・容量不足・保存拒否を成功と表示しない。旧localStorageキャッシュは削除せず移行／読取フォールバック。保存ビルドのキー・形式は変更なし。
- 手動で前の版に戻せる。新規IDが消える復元は保守的に拒否するため、全ての更新を巻き戻せるとは限らない。
- レビューで見つかった描画例外時の復元、破損activeの再利用、別タブのactive/previous変更、スキルlevel/name検証を修正。切替レシートから両世代を正確に復元し、別タブ変更時は上書きせず復元未完了を表示。
- 計算関数、Technique DB、保存ビルド処理は変更していない。

## 証拠と実行範囲

作業親ディレクトリ `../evidence/`:

- `idb-cache/result.json`: 最初の実API取得12シナリオ。取込日時 `2026-04-15T01:28:18+00:00`、武器1160、防具714、装飾品361、護石64、スキル179、セット194、モンスター34。約7.6MBをIndexedDBに保存。旧localStorage容量超過を回避。
- `idb-cache-reviewed/result.json`: 最終修正後は上記取得済みデータのfixtureで限定再検証。実API再取得ではない。通信遮断リロード、異装備A/B、途中通信・version変化・空配列・ID変更・容量不足、更新と復元、描画例外3経路と初回、破損キャッシュ、別タブ競合、旧キャッシュ移行と保存拒否を検証。
- A/B: 武器309、A頭516、B頭600。保存→API遮断リロード→個別復元→比較→更新／旧版復元で保存領域が同一。異装備が異火力になるとの主張はしない。
- `round2-before/`, `round2-after/`: DB作業前のUI修正5幅（375/390/768/1024/1440）の画面証拠。`ui-checkpoint/index.html` がUI区切り。DB最終修正後の5幅撮影ではない。
- `tools/local-mhdb-cache-browser.cjs`: 再現スクリプト。既定は実API取得。`CACHE_FIXTURE` に外部の取得済みJSONを指定可能。応答JSONはリポジトリへ追加しない。

## 残課題

Safari・iPhone・iPad実機は未確認。ブラウザの永続ストレージはOSによる削除やサイトデータ消去を防げず、アプリ全体のオフライン配信を保証しない。初回オフライン利用用の再配布DB同梱、API応答全体の再配布条件確認、ゲーム版適合確認は今回未実施。UIのiPhone内部6:4、アイコン図柄、実機操作感はオーナー受入待ち。PR統合・公開判断は保留。

最終結果: 39件のNode検証、17件のキャッシュChromiumシナリオ、8件のレスポンシブ検証が成功。`git diff --check` 成功。

## 独立レビュー追補修正

P1再現: version取得を失敗させると、永続化・DB切替前にもrecoverDataActivationがrenderAllを呼び、renderMonsterPartsでmonsterStateが再生成された。歴戦王アルシュベルド20:kingのreleasedOffがreleasedへ変わるChromium反例を確認した。
修正: 切替レシートがない失敗では装備画面を再生成しない。切替後の描画失敗は旧DB・ビルドに加え入力値とselect選択肢を復元し、旧条件で表示を再計算する。成功時も条件を引き継ぐが、新DBの選択肢は上書きしない。ファイル入力は対象外。計算式や保存ビルド形式は変更しない。

P2再現: skills欠落を`|| []`で空配列と扱っていた。武器・防具・装飾品・護石ランクのskillsを必須配列、護石ranksを必須配列として検証。undefined/null/文字列/オブジェクトは拒否し、正規の空配列は許可。推測補完なし。根拠は[MHDB公式API契約](https://docs.wilds.mhdb.io/)のArmor / Weapon / Decoration / CharmRank各skillsとCharm.ranksの配列型、および既存経路で取得済みの実データ。今回の修正は該当フィールドの検証であり、全APIフィールドを網羅するvalidatorではない。

破損active救済: activeが検証不合格（または欠落）でpreviousが検証成功した場合のみ、両レコードの競合確認後にpreviousをactiveへ昇格。previousも検証済みデータを保持し、破損データを巻戻し対象にしない。画面には前版救済と保存装備ID不足の可能性を明示。破損activeの内容をID互換性の根拠にはできないため、最新保存装備が旧版で解決できる保証はしない。両版破損時は救済不可。

追加検証（全て取得済み実API fixture、実APIの再取得ではない）:
- `../evidence/cache-review-final/result.json`: fail-fast 6項目。version取得失敗、active put成功イベント後のtx.abort、commit後描画失敗でreleasedOff・計算結果・表示・両世代・保存領域を比較。成功更新時の条件維持、破損active起動時救済、最終5幅と異装備A/B保存比較／再起動復元。
- `../evidence/cache-review-final/final-{375,390,768,1024,1440}.png`: 最終UI/DBコードから撮影。`layouts.json`に文書幅。375/390/768は外側縦、1024/1440は横。1440は内部装備／スキル横、1024以下は内部縦。長い装備入力画面と既存固定版表示バーは残存し、受入済みとは扱わない。
- `../evidence/idb-cache-final/result.json`: 既存17シナリオ再成功。前回の17シナリオもfixture。最初の実API取得記録は`idb-cache/result.json`のみ。
- Node40件、レスポンシブ8件成功。追加の配列検証は修正前FAIL→修正後PASS。releasedOff反例も修正前FAIL→修正後PASS。Safari実機未検証。

最終製品ファイルSHA-256:
- index.html: `b2c3fa8b22dab2a5e666755a07b3b18a97b1f28076c6293c3df7e800dbcaee1a`
- ui/local-mhdb-cache.js: `ed03fe6b18dee5d3fda5f0839330816cc54d6448f923916c3053b653b303ff85`

HEADはa0b60f39fa5798a371ad0dad56f5f3e9e2c253ab。未コミット差分として保持。原本・他worktree、commit/push/統合/公開は未操作。
