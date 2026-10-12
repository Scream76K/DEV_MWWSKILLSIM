# 確認済み機能と未確認の設定

collaborationのspawn_agent/followup_task/send_message/list_agentsが利用可能。6名を実際に起動し、指定TOMLと役割文書の読取を委任、全6名から結果を回収。最大同時実行は主を含め4枠。別コンテキストだが共有ファイルシステム。

.codex/config.tomlとagents/*.tomlは公式の役割設定形式で作成しTOML構文検査済み。今回のcollaborationツールにはagent_type引数がないため、TOMLを明示的に読ませて委任した。プロジェクト設定の自動ロードやTOML read-only sandboxの自動適用は未確認。設定ファイルだけを根拠に起動可能と判断していない。

CLI 0.162.0-alpha.17.2、multi_agent=trueを確認。debug prompt-inputでAGENTS読込を確認したが役割登録の自動適用を証明する結果ではない。

独立アプリスレッド、追加Git worktreeは今回作成なし。現在は専門担当の読取・レビューを並行運用できる。製品編集はhimmelのみ、index.htmlの同時編集は禁止。並行書込は未コミット基準の保護と個別許可パス・別作業場所の承認後に開始する。

参考：公式[エージェント設定](https://learn.chatgpt.com/docs/agent-configuration/subagents)、[設定リファレンス](https://learn.chatgpt.com/docs/config-file/config-reference)。再起動時は新作業フォルダを開きAGENTS/TASKSを読み、設定ロードと起動を再確認。実行中エージェントの自動復元は保証しない。

第3段階追記：serieをcollaborationの明示役割指示で起動・回収。roles/serie.md保存。TOML自動登録は未実施。専門7担当（主を含め8名）の実委任を確認。最大同時4枠と共有FSの制約は同じ。
