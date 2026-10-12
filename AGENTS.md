# 勇者一行 共通開発ルール

作業場所はこのAGENTS.mdを置いたリポジトリ/worktreeのルート。開発の正本はGitHub origin/develop。作業開始時に最新リモートHEADを確認し、承認された作業ブランチまたは隔離されたdetached worktreeで作業する。既存の別worktreeへ無断で変更を加えない。起動時に pwd、git branch --show-current、git status、git worktree list を確認する。main/developなら編集を開始しない。初回組織構築の委任は読み取り専用。r250第3段階はユーザーの後続指示により、ヒンメルが根拠付き最小製品修正・旧テスト整合を担当。専門担当は明示された調査・独立レビューのみ。

指揮系統：ユーザーが最終意思決定。ChatGPTは仕様・技術方針の整理とレビュー。himmel（ヒンメル）がタスク管理・委任・実装統合。専門担当は frieren、stark、heiter、fern、eisen、sein、serie（ゼーリエ：技術方針・品質ゲート判断支援）。第3段階ではこの8名とし、番号CALC/UI/DATA/QA/ARCH/OCRは責務の識別にのみ使用する。

- 既存機能の退行防止を最優先。既存の未コミット変更を破棄・退避して消去しない。
- MHDBは装備・スキル数値、Technique DBは技計算数値の正本。相違があれば根拠付き保留にし、別の数値正本を作らない。
- 推測でMV、Hit、属性補正、ビン回数、時間などを確定しない。暫定値は出典・対象版・採用範囲・検証状態を記録。
- source_confirmed（出典で確認）とverified（明示した対象版/条件で検証）を区別。資料の存在だけで検証済みへ昇格しない。
- 非正規化 powerIndex/maxPowerIndex と基準100 relativePowerIndex/relativeMaximumPowerIndex を区別。
- 仕様変更はプロダクトオーナー（ユーザー）の承認が必要。ChatGPTや担当者の提案は承認ではない。
- main/developへの直接変更は禁止。今回はcommit/push/PR/merge/rebase/reset/clean/公開を禁止。履歴操作、worktree移動/作成は別タスクで安全確認と許可を行う。同じブランチの強制重複checkoutは禁止。
- origin/developとの差は毎回確認する。固定の先行コミット数を仮定せず、内容一致と履歴統合を区別する。勝手に履歴操作しない。
- 既存Git専用143ファイルは削除禁止。第2段階で旧OCR11テストの根拠付き更新を行い、原本をdocs/reports/r250-stage2/evidence/before-worktree.tar.gzへ保存。残る132ファイルは内容ハッシュ一致を維持。README/spec/assets/db_icons/data/OCR・旧evidence配置を削除しない。
- index.htmlの編集者は同時に1人。初期運用ではヒンメルのみ編集可能。担当者は関数/領域と変更案を提出し、FILE_OWNERSHIP.mdの台帳で承認後に統合する。
- 各変更には影響に対応する回帰検証を付ける。文書・設定変更は構文、参照、名称、保全ハッシュを検証。製品変更には不具合の最小再現、修正前失敗、修正後成功、必要な関連スイートを用意。
- テストの期待値を無条件に変更しない。A製品/B旧期待値/C環境/D判定不能を根拠で区別。不明原因は修正しない。失敗・未実行・skipを隠さない。
- シェルやテストが監査JSONを生成する場合も書き込みである。読み取り専用調査では書き込みスクリプトを原本で起動しない。必要ならヒンメルが一時コピーで実行し、結果と実行場所を明示。
- サブエージェントは同じファイルシステムを共有する。独立コンテキストはworktree分離や書き込み権限分離を意味しない。現在のcollaboration起動ではTOMLのread-only設定が自動適用されたと主張しない。
- 専門担当は明示された1タスク・許可パスに限定し、無断で別担当へ再委任しない。今回の専門調査では一切ファイルを書かず、指定形式で結果を返す。

詳細：docs/agents/README.md、FILE_OWNERSHIP.md、GIT_WORKFLOW.md、TASKS.md、templates/。
