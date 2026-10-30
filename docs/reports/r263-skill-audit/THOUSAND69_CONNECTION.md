# 通常千々矢＋特殊射撃強化69

承認 Sentinel_9251b08f6ee4819190ccebc260564b37（2026-10-29 21:36 JST）。OWNER_APPROVED_PROVISIONAL、現行実機未確認。

対象は BOW_THOUSAND_DRAGONS を1回。既存DBのMV25×6Hitをそのまま参照。全6Hit同一部位、無属性・NONEビン・CRITICAL距離・導ノ矢なし。溜め3条件や3射のForce/刃鱗契約は使わない。常時射撃1.1×距離1.0を1回。69Lv1/2の物理1.1/1.2はattackflatを含む算出物理へ各Hit1回。属性・部位耐久は非採用。

index.htmlのDB sourceFormulaを単一係数源として登録し、adapterは既存reference種別bowの中で専用consumer BowReference.thousandDragonsへdispatch。固定標準sourceFormulaを流用しない。engine/bundle変更なし。公開技一覧へ1ID追加。

新技で確認したスキルは攻撃・見切り・超会心・挑戦者と69のみ。それ以外の併用/系列、抜刀Hit入力は未採用として拒否。反復、ビン/距離条件外、属性ありも理由付き拒否。通常最大は同じ射撃条件で別の完成攻撃/会心を消費する。既存の他技は変更しない。

## 実行値
合成弓 base90、affinity10、攻撃5 (×1.04+9)、挑戦者1最大(+4/+3%)、弾肉質80。
|69|通常|最大|
|---|---:|---:|
|なし|138.8178|145.28514|
|Lv1|152.69958|159.813654|
|Lv2|166.58136|174.342168|

公開calcBuild→共通Pipeline→専用consumerのtrace6Hit/shotCount1。反復・Force併用・NEARを固有guardで拒否。保存Lv1/Lv2の2件比較、共有CRITICAL/NONE保持、通常読込と現在条件復元を確認。距離は従来の共有比較条件であり保存ビルド個別状態へ新設していない。

最終exit0。初回DB登録順の製品初期化失敗、次の共有条件を戻し忘れたハーネス失敗も生ログ保持。thousand69-execution.json / thousand69.patch / thousand69-after.json参照。修正前の公開再実行は別途行わず基点ソース保存。全体回帰/ゲーム実測/実装備成立未検証。

根拠: https://macarongamemo.com/entry/mhwilds-bow-motion （2025-06-04、固定6Hit・補正）、https://kuroyonhon.com/mhwilds/program/skill.php （69物理1.1/1.2）。既存DBの部位耐久根拠不足は保持。HP限定参考として採用。

69は欠落→部分（限定接続・レビュー待ち）、23/94と他の特殊射撃対象は未解消。Git commit/push/統合なし。
