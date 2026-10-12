# r250 develop移行：承認済み成果の納品記録

2026-10-12。基点 origin/develop 08872bb756f6fd07d0b8626ad2ec472df8141bae。移行worktreeで承認候補653ファイル（629追加/24更新）を検証。製品コードは前回1477合格時から変更なし。環境非依存AGENTSは承認された移行修正。

対象一覧：[COMMIT_PAYLOAD_CANDIDATE.txt](COMMIT_PAYLOAD_CANDIDATE.txt)。この653件に本報告・対象一覧・保全証跡・現在の3テストログの計6ファイルを加える。実装候補653＋報告証跡6＝659パス、更新24/追加635/削除0の予定。過去画像188/ログ205/.codex/保全tar/node_modulesは投入しない。

Node878/DOM465/Browser+integration+OCR+Template134、合計1477合格/失敗0/skip0。移行専用環境の実行証跡：[Node](evidence/node.log)、[DOM](evidence/dom.log)、[Browser等](evidence/browser.log)。今回の認証再開後は製品/test差分なしのため同じ検証済み結果を再利用し、追加実行したとは記載しない。

元r250全1484ファイル開始ハッシュ、git status不変、653候補のうち製品等652は元内容一致、AGENTSだけ環境非依存。基点423追跡欠落0。[保全証跡](evidence/PRESERVATION.json)。従来539数値変更なし、HBG竜撃弾の22条件モデルは解析資料/テストのみで未接続を維持。

push前：Scream76K HTTPS認証、GitHub develop基点一致、通常push dry-run成功。Pagesはlegacy/main rootをAPI読取確認。mainや公開設定は変更しない。候補に欠落/5MiB超/定型credentialパターン一致なし。全形式の機密情報不存在を保証する検査とは区別。

共有5ファイルは最新develop履歴基点で承認local差分を採用、弓standard API/HBG通常弾/比較JSON互換を回帰検証。新しいHBG本接続はなし。

既知残課題：HBG設計補完後の独立再レビュー/5爆発と2Hit対応/具体ゲーム版/丸め、版表示混在、Safari実機、独立依存install/CI（今回node_modulesを読み取りsymlink再利用）、過去の非必須画像/ログは別保全。Jiraステータス変更は行わない。

関連課題：KAN-13/KAN-14/KAN-17/KAN-19/KAN-20/KAN-21/KAN-22/KAN-23/KAN-24。履歴を維持する1つの統合baselineコミットとして承認済み成果を保持。commit後のSHA/リモート検証はチャットの完了報告に記録（自身のSHAをcommit本文へ循環参照させない）。
