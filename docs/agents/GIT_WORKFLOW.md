# Git・worktree・再起動時の運用

現行：/Users/scream/Projects/DEV_MWWSKILLSIM-r250 / codex/integrate-r249 / HEAD fb6d82cd525da9273af10ac6b719f330208608c5。main/developは同じベース。origin/developは08872bbで先行3コミット。今回履歴操作なし。

既存移行バックアップ：/Users/scream/Documents/Codex/2026-10-10/mhwilds-simulator-r249-r249-r250-1/work/r250-migration-backup-20261010。全worktreeと共有.git管理情報、前後manifestを保持。バックアップを別checkoutとして使用しない。今回前状態も/private/tmp/mhwilds-agent-org-beforeに保護し、docs/agents/evidenceにハッシュ検証記録を保存する。

初回：共有worktreeの読み取り専用調査。6人の実行コンテキストは独立だがファイルは共有。主+3人までの枠で2回に分ける。新しいworktreeや専用アプリスレッドは今回作らない。

将来の書き込み分離案（未実施）：未コミット統合状態を含む基準の固定方法をユーザーと合意してから、別名ブランチ/別worktreeを各書き込み担当へ用意する。現状HEADだけからworktreeを作るとr249/r250未コミット成果を含まないため禁止。ブランチ名・作成方法・未コミット成果のコピー対象・ハッシュ・依存関係をレビューしてから実行する。force同一ブランチcheckoutはしない。

commit禁止中の代替：himmelが読み取り専用の基準コピーをGit管理情報とは切り離して用意し、担当は承認された別コピーで案を作る。成果はパスと基準ハッシュを持つ差分として回収し、index.htmlはhimmelが1件ずつ統合する。コピーはGit worktreeと称しない。コピー中の.gitは再利用しない。これは将来案で、今回未実施。

独立アプリスレッド案：ユーザーが明示的に求めた場合のみ作成する。専用スレッドはサブエージェントとは別機能。共有worktreeのまま書き込み分離済みと主張しない。

再起動：Codexで新パスをプロジェクトとして開く。AGENTS.md/ .codex/config.toml / agents/*.toml / TASKS.mdはファイルとして維持されるが未コミットなのでバックアップを保持する。信頼されたプロジェクト設定として読み込まれるかを起動時に確認する。既存サブエージェントの再起動後生存を保証しない。台帳を読んで未完了タスクを新規起動・再委任する。旧コンテキストが自動復活したと主張しない。
