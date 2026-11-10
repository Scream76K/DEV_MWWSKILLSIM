# 現行参照: 出典・適用範囲・確認状態

更新: 2026-11-10 / SPEC-20261110-01

現行契約と確認対象SHA・製品hashは [CURRENT_CONTRACTS.md](CURRENT_CONTRACTS.md)。統合・検証状態は [INTEGRATION.md](../INTEGRATION.md)、履歴対応は [INTEGRATION_LINEAGE.md](../INTEGRATION_LINEAGE.md) を参照する。以下のr139・ゲーム版1.042.00.02は旧資料の対象版であり、現在の全DB・全採用係数の対象版を証明しない。

出典の版、採用範囲、source_confirmedと実機verifiedを区別し、未確認を現在版で検証済みへ昇格しない。

## 履歴: r139本文（原文保持）

# 出典・適用範囲・不足情報
現行コード基準: r139（index.html、evidence-review.js、各reference.js、tests/）。ゲーム版: 1.042.00.02。
公式: MHDB（装備・武器・スキルデータの優先参照元）。
参考: https://macarongamemo.com/entry/mhwilds-bow-motion ; https://kuroyonhon.com/mhwilds/d/dame.php ; https://gamewith.jp/mhwilds/484655
動画参考: こたつ氏14武器、さらだ氏弓 https://youtu.be/E5vkLlVN7gI （個々の採用内容は要照合）。

## 明示的な限界
- この統合版は現行コードと確定済み方針に基づくが、全武器の技／スキル／護石の数値仕様を逐条網羅したものではない。
- r139の実装・検証ステータスと実ゲームの完全一致は同義ではない。
- 過去資料にしか存在しない確定事項がないか、今後GitHub上の現行コード・MHDB・実測動画と突合して補完する。
- 廃止済み旧Revisionの本文を現行仕様として収録しない。
