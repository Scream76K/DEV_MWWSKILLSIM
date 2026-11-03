# 護石判定表示の是正 — 限定受入済み

ユーザー訂正 Sentinel_5784cd0a22748191a1c8ddb42bfc18e6 に対応。現行表示は情報不足を「未確認」、確定した入力条件違反を「条件不一致」と具体的理由で示す。内部 possible / unconfirmed / invalid の条件・戻りstatus、F-01、装備・保存データは変更しない。

## 差分
index.html validateCurrentCharm の共通label、スロット未登録分岐の説明、重複/入力種別/Lv範囲の具体的説明、保存比較coverage注記の「未算出」表現のみ。テンプレ読込・護石表示は同じ共通結果を使用。
過去REPORT・生ログ・原資料は履歴として保持。旧ocr_script.jsの別実装は現行indexから参照されていないため編集しない。index内のOCRコードコメントはユーザー表示ではない。現行画面に禁止表現は残さない。

## 最小確認
tools/stage4-charm-wording-proof.cjs：JSDOM＋回収実DB。RED exit1（旧labelに対する期待差）、GREEN exit0。
実テンプレKOTATU_IG_01読込で護石はunconfirmed/未確認のまま。公開HP参考経路は通常77.73／最大111.91。実装備の護石成立を確定した結果ではない。
登録済みスロット対照はpossible/実現可能。公式Lvはあるが護石ルール未登録、未登録構成/名称はunconfirmed/未確認。Lv上限・ゼロ・小数・不正種別・既知系列種別・スロット・重複はinvalid/条件不一致と理由を表示。これらはメモリ内の検証入力であり実装備や保存値の変更ではない。
同内容2保存の読込・共有比較・条件/保存map不変を確認。異装備A/Bではない。charm-kind-green.jsonの内部status列とHP metricsに一致。
LAN含むadapter不変、製品変更は表示文字列のみ。実機/Safari/F-01注入/全回帰は未実行。旧証拠を書換えていない。commit/push/統合なし。

## 次候補
PRIMARY_USE_NEXT_DECISION.mdに基づきHBG原ビルドの散弾Lv3を優先候補とする。ID2物理1.05は既承認で再承認不要。ただしHBG_SPREAD_AMMO_3のHit/Formula/イベント・射撃状態の限定consumer契約は未採用。通常弾成功を散弾主用途成功とせず、その契約をまとめて判断対象にする。GL HIGHフルバーストもHIGH対象・守勢・152混合の範囲追加判断が残る。今回これらを実装していない。

独立レビュー01a19508-daf0-7171-ae57-242dfee2f988：限定受入可、必須修正なし。受入記録のみで製品・テストの変更/再実行なし。
