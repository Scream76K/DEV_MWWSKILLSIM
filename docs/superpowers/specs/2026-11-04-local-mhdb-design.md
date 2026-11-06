# MHDBローカル化: 実装前のデータ境界

ユーザーはDBローカル化と更新実装を承認済み。計算変更、保存ビルド形式変更、commit/push/公開は対象外。未確認外部データを再配布用へ取り込まない指示を維持する。

## 現状
- index.html normalizeDBはAPI形の7配列を使用。Technique DB/コンボは別の埋込正本。motionValuesは空配列維持。
- data/README.md / DATA_SOURCE_MANIFEST.jsonは資料専用、runtime DBではない。dataディレクトリ36KB。
- 全DBはcompact UTF-8約7.61MB。weapon2.858MB、armor1.671MB、charms0.324MB、decorations0.182MB、skills0.105MB、sets1.979MB、monsters0.488MB。gzip参考合計約0.99MB。配信時の圧縮保証ではない。
- localStorageの全DB保存は通常UIから容量超過。catchで握りつぶし、再読込後DB消失。装備セットキーmh-wilds-builds-v625は別で小さく、保存維持を実測済み。
- /version=2026-04-15T01:28:18+00:00（インポート日時）。ゲーム版と分離する。
- 上流mhdb-wilds-data HEAD=c50a1eb892f4a1ad9bb35c147801658804be2cc2、commit日時2026-04-14T22:12:47Z。Armor.json blob=5ff4afbf00381da1e6b076d664a77de1ce500fd9。GPL v3 LICENSEあり。
- 上流Armor.jsonは194セット内714pieces、現在APIと全防具名一致。rawのpieceにはAPI idがない。スキルはgame_id→level辞書、APIはid付きSkillRank。rawの装備をそのままnormalizeDBへ渡せない。
- applyBuildSnapshotはweaponId、armor IDsをAPI idとして参照。名前からID推測、配列位置による自動採番は禁止する設計。

## 方式比較と推奨（実装者提案、未確定）
1. API互換スナップショットを同梱し、同じ形式の更新を検証・IndexedDBへ保存。現行計算と保存IDを維持できる最小方式。API応答の必要範囲の再配布条件と、許諾済みrawとの対応を確定する必要あり。取得済みローカル証拠を黙って製品DBへコピーしない。
2. 許諾済みrawから専用変換器を実装。明示的なAPI id対応表、全7集合の数値・参照一致検証が必要。独自の再採番や旧データへの置換を避けるため大きな別作業になる。
3. APIから取得したデータを端末IndexedDBにのみ保持。容量問題は直るが初回起動の同梱DB要件を満たさないので単独では採用しない。

## 推奨実行構成
- 同一originの相対URLからmanifestとJSONをfetch。GitHub Pagesのリポジトリ配下パスでもroot絶対パスに依存しない。画像やAPI秘密情報は同梱しない。
- manifest: schemaVersion, snapshotId, locale=ja, sourceRepository/commit, API importVersion, capturedAt, adapterVersion, gameBaselineVersion, gameVersionVerification, dataset counts, SHA256, attribution/license/source paths。ゲーム適合未確認を日付から推定しない。
- 起動: 完整性検証済み端末更新版→同梱版→既存旧キャッシュの明示的移行候補。整合不明な新旧混合をしない。利用可能な同梱版の読込完了前は装備読込を開始しない。
- 明示更新: /versionを前後で確認し、候補全体を別メモリで取得。必須配列・重複ID・全14武器kind・参照整合・使用中/保存済みIDの同一性を検査し、全成功後だけIndexedDB transactionでactive/previousを交換。
- 更新途中失敗、版変化、破損hash、ID再割当、quota/IndexedDB拒否時は旧active・画面状態・保存ビルドを保持し失敗理由を通知。「取得できた」だけで更新保存成功としない。
- 前版へ戻す操作をDB専用に設け、装備セットを削除しない。保存ビルド形式は変えずDB依存を明示。別版でID解決不可なら既存fail-closedを維持。
- 同梱更新は保守用コマンドが候補ディレクトリ生成→検証→manifest更新の順。ブラウザの更新は端末内だけでGitHubファイルを書き換えない。
- サービスワーカーは現状なし。静的配信での起動と完全オフライン起動は区別し、後者はこの最小変更で保証しない。

## 未確定・親タスク判断
API互換スナップショットの取り込み範囲を許諾済みraw由来のデータとして確定するか、専用変換器と対応表を作るか。権利条件およびデータID境界の確定までは、製品同梱・DBローダー置換を未実施。推測変換で現行保存ビルドを危険に晒さない。

## Approved follow-up scope

The parent authorized per-device API acquisition and IndexedDB caching without redistribution. Implement option 3 first. Bundled initial data and raw conversion remain out of scope. Keep API IDs and saved-build storage unchanged. All seven endpoint fetches must finish, version must be stable, validation and persistence must succeed before activation. Retain legacy localStorage unchanged during migration or fallback. ID disappearance/reassignment is conservatively rejected across all existing records, including rollback; this can reject rollback after adding new records.
